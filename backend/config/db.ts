import pg from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Define Database Client/Pool Interface
export interface DbPool {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number }>;
  isSQLite: boolean;
}

let dbPool: DbPool;

const usePostgres = !!process.env.DATABASE_URL;

// Mirrors the SQLite bootstrap path: if the schema hasn't been applied to this
// PostgreSQL database yet (fresh Render/managed Postgres instance), create it from
// schema.sql and seed it from seed.sql. Safe to run repeatedly since both files use
// CREATE TABLE IF NOT EXISTS / ON CONFLICT-safe inserts are guarded by try/catch below.
const bootstrapPostgresSchema = async (pool: pg.Pool) => {
  try {
    const { rows } = await pool.query(
      "SELECT to_regclass('public.users') as exists"
    );
    const usersTableExists = !!rows[0]?.exists;

    if (!usersTableExists) {
      console.log('PostgreSQL: users table not found. Bootstrapping schema and seed data...');
      const schemaSqlPath = path.join(process.cwd(), 'backend', 'database', 'schema.sql');
      const seedSqlPath = path.join(process.cwd(), 'backend', 'database', 'seed.sql');

      if (fs.existsSync(schemaSqlPath)) {
        const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
        await pool.query(schemaSql);
        console.log('PostgreSQL schema applied successfully.');
      }

      if (fs.existsSync(seedSqlPath)) {
        // seed.sql uses backslash-escaped quotes (\') for the SQLite path; standard
        // Postgres string literals escape a quote by doubling it ('').
        const seedSql = fs.readFileSync(seedSqlPath, 'utf8').replace(/\\'/g, "''");
        try {
          await pool.query(seedSql);
          console.log('PostgreSQL seed applied successfully.');
        } catch (seedErr: any) {
          console.warn('PostgreSQL seed encountered an issue (may be partially applied):', seedErr.message);
        }
      }
    } else {
      const { rows: countRows } = await pool.query('SELECT COUNT(*) as count FROM users');
      const userCount = Number(countRows[0]?.count ?? 0);
      if (userCount === 0) {
        console.log('PostgreSQL users table exists but is empty. Re-running seed...');
        const seedSqlPath = path.join(process.cwd(), 'backend', 'database', 'seed.sql');
        if (fs.existsSync(seedSqlPath)) {
          const seedSql = fs.readFileSync(seedSqlPath, 'utf8').replace(/\\'/g, "''");
          try {
            await pool.query(seedSql);
            console.log('PostgreSQL seed applied successfully.');
          } catch (seedErr: any) {
            console.warn('PostgreSQL seed encountered an issue (may be partially applied):', seedErr.message);
          }
        }
      } else {
        console.log(`PostgreSQL database already bootstrapped (${userCount} users found).`);
      }
    }
  } catch (error: any) {
    console.error('Failed to bootstrap PostgreSQL schema:', error.message);
    throw error;
  }
};

const ensureAuthVerificationColumns = async () => {
  try {
    if (!dbPool) return;

    const columnRows = dbPool.isSQLite
      ? (await dbPool.query('PRAGMA table_info(users)')).rows
      : (await dbPool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'")).rows;

    const existingColumns = new Set((columnRows || []).map((row: any) => String(row.column_name || row.name || '').toLowerCase()));

    const statements: string[] = [];
    if (!existingColumns.has('email_verified')) {
      statements.push("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT TRUE");
    }
    if (!existingColumns.has('verification_code')) {
      statements.push('ALTER TABLE users ADD COLUMN verification_code VARCHAR(10)');
    }
    if (!existingColumns.has('verification_code_expires_at')) {
      statements.push('ALTER TABLE users ADD COLUMN verification_code_expires_at TIMESTAMP');
    }
    if (!existingColumns.has('verification_attempts')) {
      statements.push('ALTER TABLE users ADD COLUMN verification_attempts INTEGER DEFAULT 0');
    }
    if (!existingColumns.has('verification_last_sent_at')) {
      statements.push('ALTER TABLE users ADD COLUMN verification_last_sent_at TIMESTAMP');
    }

    for (const statement of statements) {
      await dbPool.query(statement);
    }
  } catch (error: any) {
    console.warn('Could not ensure auth verification columns:', error.message);
  }
};

// Resolves once the database backend (Postgres or SQLite) is ready to serve queries.
// server.ts awaits this before accepting requests.
let dbReadyResolve: () => void;
let dbReadyReject: (err: Error) => void;
export const dbReady: Promise<void> = new Promise((resolve, reject) => {
  dbReadyResolve = resolve;
  dbReadyReject = reject;
});

if (usePostgres) {
  console.log('Database Config: DATABASE_URL found. Connecting to PostgreSQL...');
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Test the connection immediately. If DATABASE_URL is set, PostgreSQL is required —
  // there is no SQLite fallback, so a connection failure is a fatal startup error.
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Database Error: Failed to connect to PostgreSQL via DATABASE_URL.', err.message);
      dbReadyReject(err);
      return;
    }

    console.log('Connected to PostgreSQL');
    release();
    dbPool = {
      query: async (text: string, params?: any[]) => {
        const res = await pool.query(text, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount || 0,
        };
      },
      isSQLite: false,
    };

    (async () => {
      await bootstrapPostgresSchema(pool);
      await ensureAuthVerificationColumns();

      // Ensure profile_picture column exists on PG
      try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;');
      } catch (e: any) {
        console.warn('Could not alter PG users table:', e.message);
      }

      dbReadyResolve();
    })().catch((initErr) => dbReadyReject(initErr));
  });
} else {
  console.log('Database Config: No DATABASE_URL env found. Initializing local SQLite database...');
  initializeSQLite(dbReadyResolve, dbReadyReject);
}

function initializeSQLite(onReady?: () => void, onError?: (err: Error) => void) {
  const dbDir = path.join(process.cwd(), 'backend', 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'ethio_matric.db');
  const dbExists = fs.existsSync(dbPath);

  console.log(`SQLite database path: ${dbPath} (Exists: ${dbExists})`);
  const sqliteDb = new sqlite3.Database(dbPath);

  // Expose dbPool with standard pg interface
  dbPool = {
    isSQLite: true,
    query: (text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> => {
      return new Promise((resolve, reject) => {
        // Translate PostgreSQL $1, $2, etc. placeholders to SQLite ?
        let sqliteSql = text.replace(/\$\d+/g, '?');

        // Translate ILIKE to LIKE for SQLite
        sqliteSql = sqliteSql.replace(/\bILIKE\b/gi, 'LIKE');

        const isInsertUpdateDelete = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(sqliteSql);

        if (isInsertUpdateDelete) {
          sqliteDb.run(sqliteSql, params, function (this: any, err: Error | null) {
            if (err) {
              console.error('SQLite execution error:', err.message, '\nSQL:', sqliteSql);
              reject(err);
              return;
            }

            const returningMatch = sqliteSql.match(/\bRETURNING\b\s+(.+)$/i);
            if (!returningMatch) {
              resolve({ rows: [], rowCount: this ? this.changes : 0 });
              return;
            }

            const returningCols = returningMatch[1].trim();
            const tableMatch = sqliteSql.match(/^\s*(?:INSERT\s+INTO|UPDATE)\s+([a-zA-Z0-9_\.]+)/i);
            const tableName = tableMatch?.[1]?.replace(/^"|"$/g, '') || '';
            const isInsert = /^\s*INSERT\b/i.test(sqliteSql);
            const whereMatch = sqliteSql.match(/\bWHERE\b(.+?)\s*(?:RETURNING\b|$)/i);

            let selectSql = `SELECT ${returningCols === '*' ? '*' : returningCols} FROM ${tableName}`;
            let selectParams: any[] = [...params];

            if (isInsert) {
              selectSql += ' WHERE rowid = ?';
              selectParams = [this?.lastID ?? 0];
            } else if (whereMatch) {
              selectSql += ` WHERE ${whereMatch[1].trim()}`;
            }

            sqliteDb.all(selectSql, selectParams, (selectErr, rows) => {
              if (selectErr) {
                console.error('SQLite returning query error:', selectErr.message, '\nSQL:', selectSql);
                reject(selectErr);
                return;
              }

              const formattedRows = (rows || []).map((row: any) => {
                const newRow = { ...row };
                for (const key in newRow) {
                  if (key.startsWith('is_') && (newRow[key] === 0 || newRow[key] === 1)) {
                    newRow[key] = newRow[key] === 1;
                  }
                }
                return newRow;
              });

              resolve({ rows: formattedRows, rowCount: formattedRows.length });
            });
          });
        } else {
          sqliteDb.all(sqliteSql, params, (err, rows) => {
            if (err) {
              console.error('SQLite query error:', err.message, '\nSQL:', sqliteSql);
              reject(err);
            } else {
              // Convert binary-like numbers or booleans from 0/1 to true/false for matching PG expectations
              const formattedRows = (rows || []).map((row: any) => {
                const newRow = { ...row };
                // SQLite returns 0/1 for boolean. Let's map columns starting with "is_" or ending with "_active" to boolean if they are numbers.
                for (const key in newRow) {
                  if (key.startsWith('is_') && (newRow[key] === 0 || newRow[key] === 1)) {
                    newRow[key] = newRow[key] === 1;
                  }
                }
                return newRow;
              });

              resolve({
                rows: formattedRows,
                rowCount: formattedRows.length,
              });
            }
          });
        }
      });
    },
  };

  // If the database is new or empty, run schema.sql and seed.sql
  sqliteDb.serialize(() => {
    // Enable Foreign Keys in SQLite
    sqliteDb.run('PRAGMA foreign_keys = ON;');
  });

  // Run database initialization in an async IIFE to ensure perfect sequential execution of promises
  (async () => {
    const runSql = (sql: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    };

    const getRow = (sql: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    try {
      const schemaSqlPath = path.join(process.cwd(), 'backend', 'database', 'schema.sql');
      const seedSqlPath = path.join(process.cwd(), 'backend', 'database', 'seed.sql');

      // Check if users table exists
      const row = await getRow("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");

      if (!row) {
        console.log('Tables do not exist. Bootstrapping SQLite database with schema and seed data...');
        if (fs.existsSync(schemaSqlPath)) {
          let schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
          // Clean up dialect differences in DDL
          schemaSql = schemaSql
            .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/SERIAL/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/NUMERIC\(\d+,\d+\)/gi, 'REAL')
            .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
            .replace(/TIMESTAMP/gi, 'DATETIME');

          // SQLite split statements by semicolon and newline
          const statements = schemaSql
            .split(/;\s*[\r\n]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          for (const statement of statements) {
            try {
              await runSql(statement);
            } catch (err: any) {
              console.error('Failed to run schema statement:', statement, 'Error:', err.message);
            }
          }
          console.log('SQLite Schema applied successfully.');
        }

        if (fs.existsSync(seedSqlPath)) {
          let seedSql = fs.readFileSync(seedSqlPath, 'utf8');
          // Translate escaped single quotes from PostgreSQL style (\') to SQLite style ('')
          seedSql = seedSql.replace(/\\'/g, "''");

          const statements = seedSql
            .split(/;\s*[\r\n]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          for (const statement of statements) {
            try {
              await runSql(statement);
            } catch (err: any) {
              if (!err.message.includes('UNIQUE constraint failed')) {
                console.error('Failed to run seed statement:', statement, 'Error:', err.message);
              }
            }
          }
          console.log('SQLite Seed applied successfully.');
        }
      } else {
        // Safe migration: try to add profile_picture to users table
        try {
          await runSql("ALTER TABLE users ADD COLUMN profile_picture TEXT;");
          console.log("Altered SQLite users table to add profile_picture column.");
        } catch (colErr: any) {
          // Ignore error if column already exists
        }
        console.log('SQLite database users table already exists. Checking for rows...');
        const countRow = await getRow("SELECT COUNT(*) as count FROM users");
        if (!countRow || countRow.count === 0) {
          console.log('Found 0 users. Re-running SQLite seed...');
          if (fs.existsSync(seedSqlPath)) {
            let seedSql = fs.readFileSync(seedSqlPath, 'utf8');
            seedSql = seedSql.replace(/\\'/g, "''");

            const statements = seedSql
              .split(/;\s*[\r\n]+/)
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

            for (const statement of statements) {
              try {
                await runSql(statement);
              } catch (err: any) {
                if (!err.message.includes('UNIQUE constraint failed')) {
                  console.error('Failed to run seed statement:', statement, 'Error:', err.message);
                }
              }
            }
            console.log('SQLite Seed applied successfully.');
          }
        } else {
          console.log('SQLite database is already bootstrapped and populated with users.');
        }
      }

      // Ensure newer auth-verification columns exist even on older SQLite databases
      // that were bootstrapped before those columns were introduced.
      await ensureAuthVerificationColumns();

      onReady?.();
    } catch (error: any) {
      console.error('Failed to initialize SQLite database:', error.message);
      if (error.message.includes('malformed') || error.message.includes('corrupt') || error.message.includes('CORRUPT')) {
        console.error('SQLite database image is malformed or corrupt. Deleting the database and retrying...');
        try {
          sqliteDb.close();
        } catch (closeErr) { }
        if (fs.existsSync(dbPath)) {
          try {
            fs.unlinkSync(dbPath);
          } catch (unlinkErr: any) {
            console.error('Failed to delete corrupted database file:', unlinkErr.message);
          }
        }
        initializeSQLite(onReady, onError);
      } else {
        onError?.(error);
      }
    }
  })();
}

// Export the dbPool wrapper
const query = (text: string, params?: any[]) => dbPool.query(text, params);
const isSQLite = () => dbPool?.isSQLite ?? true;

export default {
  query,
  isSQLite,
};

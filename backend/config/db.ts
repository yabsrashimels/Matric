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

const usePostgres = !!process.env.DB_HOST && !!process.env.DB_NAME;

if (usePostgres) {
  console.log('Database Config: Attempting to connect to PostgreSQL at', process.env.DB_HOST);
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test the connection immediately
  pool.connect((err, client, release) => {
    if (err) {
      console.log('Database Info: PostgreSQL is not active on ' + (process.env.DB_HOST || 'localhost') + '. Utilizing local SQLite database...', err.message);
      initializeSQLite();
    } else {
      console.log('Successfully connected to PostgreSQL database!');
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

      // Ensure profile_picture column exists on PG
      pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;').catch(e => {
        console.warn('Could not alter PG users table:', e.message);
      });
    }
  });
} else {
  console.log('Database Config: No DB_HOST env found. Initializing local SQLite database...');
  initializeSQLite();
}

function initializeSQLite() {
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

        // Translate RANDOM() to RANDOM() (both support it)
        // Translate Postgres-specific limit keywords if needed

        const isInsertUpdateDelete = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(sqliteSql);

        if (isInsertUpdateDelete) {
          sqliteDb.run(sqliteSql, params, function (err) {
            if (err) {
              console.error('SQLite execution error:', err.message, '\nSQL:', sqliteSql);
              reject(err);
            } else {
              // Map sqlite results to PostgreSQL results format
              // "this" context contains changes and lastID for SQLite run
              resolve({
                rows: [],
                rowCount: this ? this.changes : 0,
              });
            }
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
    } catch (error: any) {
      console.error('Failed to initialize SQLite database:', error.message);
      if (error.message.includes('malformed') || error.message.includes('corrupt') || error.message.includes('CORRUPT')) {
        console.error('SQLite database image is malformed or corrupt. Deleting the database and retrying...');
        try {
          sqliteDb.close();
        } catch (closeErr) {}
        if (fs.existsSync(dbPath)) {
          try {
            fs.unlinkSync(dbPath);
          } catch (unlinkErr: any) {
            console.error('Failed to delete corrupted database file:', unlinkErr.message);
          }
        }
        initializeSQLite();
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

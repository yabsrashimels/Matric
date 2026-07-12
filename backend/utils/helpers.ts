import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import db from '../config/db';

// Resolve the JWT signing secret. Prefer an explicit JWT_SECRET env var (set it in
// Replit Secrets for production use). If it's not set, fall back to a secret that is
// generated once and persisted to a git-ignored local file, so tokens stay valid across
// restarts without ever hardcoding a default secret or committing it to source control.
const resolveJwtSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  const secretDir = path.join(process.cwd(), 'backend', '.runtime-secrets');
  const secretPath = path.join(secretDir, 'jwt_secret.key');

  try {
    if (fs.existsSync(secretPath)) {
      const existing = fs.readFileSync(secretPath, 'utf8').trim();
      if (existing) return existing;
    }

    fs.mkdirSync(secretDir, { recursive: true });
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(secretPath, generated, { mode: 0o600 });
    console.warn('JWT_SECRET env var not set. Generated and persisted a local signing secret at backend/.runtime-secrets/jwt_secret.key. Set JWT_SECRET in Replit Secrets for production use.');
    return generated;
  } catch (error: any) {
    console.error('Failed to persist a generated JWT secret; falling back to an in-memory secret for this process only (tokens will be invalidated on restart).', error.message);
    return crypto.randomBytes(48).toString('hex');
  }
};

const JWT_SECRET = resolveJwtSecret();

export const generateVerificationCode = (): string => {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
};

export const isVerificationExpired = (expiresAt?: Date | string | null): boolean => {
  if (!expiresAt) return true;
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now();
};

// Password Hashing
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT Generation
export const generateToken = (payload: { id: number; uuid: string; email: string; role: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Admin Notifications Logger
export const createNotification = async (type: string, message: string): Promise<void> => {
  try {
    await db.query(
      'INSERT INTO notifications (type, message) VALUES ($1, $2)',
      [type, message]
    );
  } catch (error: any) {
    console.error('Failed to write database notification:', error.message);
  }
};

// Admin Audit Logs Logger
export const createAuditLog = async (userId: number, action: string, details: string, ipAddress?: string): Promise<void> => {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, action, details, ipAddress || '127.0.0.1']
    );
  } catch (error: any) {
    console.error('Failed to write database audit log:', error.message);
  }
};

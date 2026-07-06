import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_or_default_secret';

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

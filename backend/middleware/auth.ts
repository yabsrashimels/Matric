import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/helpers';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    uuid: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      uuid: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
    return;
  }
  next();
};

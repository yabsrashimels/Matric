import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { userHasPremiumAccess } from '../services/paymentService';

export const requirePremiumAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this content.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  try {
    const hasAccess = await userHasPremiumAccess(req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Payment required. This content is available only for paid users.',
        code: 'PAYMENT_REQUIRED',
        requiredPlan: {
          name: 'Premium',
          price: 100,
          currency: 'ETB',
        },
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const attachAccessInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    (req as AuthenticatedRequest & { hasPremiumAccess?: boolean }).hasPremiumAccess = false;
    next();
    return;
  }

  try {
    const hasAccess = await userHasPremiumAccess(req.user.id, req.user.role);
    (req as AuthenticatedRequest & { hasPremiumAccess?: boolean }).hasPremiumAccess = hasAccess;
    next();
  } catch (error) {
    next(error);
  }
};

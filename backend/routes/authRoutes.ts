import { Router } from 'express';
import { register, login, verifyEmail, resendVerificationCode, googleAuth, getProfile } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', resendVerificationCode);

// POST /api/auth/google
router.post('/google', googleAuth);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

export default router;

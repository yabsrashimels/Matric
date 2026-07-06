import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/profile
router.get('/', authenticateToken, getProfile);

// PUT /api/profile
router.put('/', authenticateToken, updateProfile);

export default router;

import { Router } from 'express';
import { getProgressByUserId, updateProgress } from '../controllers/progressController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET /api/progress/:userId
router.get('/:userId', getProgressByUserId);

// PUT /api/progress
router.put('/', updateProgress);

export default router;

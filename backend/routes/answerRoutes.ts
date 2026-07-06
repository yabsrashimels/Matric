import { Router } from 'express';
import { submitAnswer, getAnswersByUserId } from '../controllers/answerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// POST /api/answers
router.post('/', submitAnswer);

// GET /api/answers/:userId
router.get('/:userId', getAnswersByUserId);

export default router;

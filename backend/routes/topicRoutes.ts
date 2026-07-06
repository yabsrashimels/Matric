import { Router } from 'express';
import { getTopics, getTopicById, createTopic, updateTopic, deleteTopic } from '../controllers/topicController';
import { validateTopic } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getTopics);
router.get('/:id', getTopicById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, validateTopic, createTopic);
router.put('/:id', authenticateToken, requireAdmin, validateTopic, updateTopic);
router.delete('/:id', authenticateToken, requireAdmin, deleteTopic);

export default router;

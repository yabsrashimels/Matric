import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  searchQuestions,
  getQuestionsBySubject,
  getQuestionsByTopic,
  getQuestionsByYear,
  getQuestionsByDifficulty,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController';
import { validateQuestion } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public / Protected Student Routes
router.get('/', getQuestions);
router.get('/search', searchQuestions);
router.get('/subject/:subjectId', getQuestionsBySubject);
router.get('/topic/:topicId', getQuestionsByTopic);
router.get('/year/:year', getQuestionsByYear);
router.get('/difficulty/:difficulty', getQuestionsByDifficulty);
router.get('/:id', getQuestionById);

// Admin-only writing routes
router.post('/', authenticateToken, requireAdmin, validateQuestion, createQuestion);
router.put('/:id', authenticateToken, requireAdmin, validateQuestion, updateQuestion);
router.delete('/:id', authenticateToken, requireAdmin, deleteQuestion);

export default router;

import { Router } from 'express';
import { getMockExams, getMockExamById, createMockExam, startMockExam, submitMockExam } from '../controllers/mockExamController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/mock-exams (Get list)
router.get('/', getMockExams);

// GET /api/mock-exams/:id (Get details with questions)
router.get('/:id', getMockExamById);

// POST /api/mock-exams/start
router.post('/start', authenticateToken, startMockExam);

// POST /api/mock-exams/submit
router.post('/submit', authenticateToken, submitMockExam);

// POST /api/mock-exams (Admin-only creation)
router.post('/', authenticateToken, requireAdmin, createMockExam);

export default router;

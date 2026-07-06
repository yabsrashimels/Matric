import { Router } from 'express';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController';
import { validateSubject } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getSubjects);
router.get('/:id', getSubjectById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, validateSubject, createSubject);
router.put('/:id', authenticateToken, requireAdmin, validateSubject, updateSubject);
router.delete('/:id', authenticateToken, requireAdmin, deleteSubject);

export default router;

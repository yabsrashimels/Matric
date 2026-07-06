import { Router } from 'express';
import { getBookmarksByUserId, addBookmark, deleteBookmark, toggleBookmark } from '../controllers/bookmarkController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET /api/bookmarks/:userId
router.get('/:userId', getBookmarksByUserId);

// POST /api/bookmarks
router.post('/', addBookmark);

// POST /api/bookmarks/toggle (React helper)
router.post('/toggle', toggleBookmark);

// DELETE /api/bookmarks/:id
router.delete('/:id', deleteBookmark);

export default router;

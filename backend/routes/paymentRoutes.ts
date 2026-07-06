import { Router } from 'express';
import { getPlans, submitPaymentRequest, getPaymentHistory } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get plans (unauthenticated users can see pricing)
router.get('/plans', getPlans);

// Submit and retrieve payments (authenticated students only)
router.post('/requests', authenticateToken, submitPaymentRequest);
router.get('/history', authenticateToken, getPaymentHistory);

export default router;

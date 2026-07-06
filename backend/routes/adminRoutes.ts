import { Router } from 'express';
import {
  getStats,
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  resetUserPassword,
  getNotifications,
  markNotificationRead,
  clearNotifications,
  updatePlan,
  getAdminPayments,
  approvePayment,
  rejectPayment,
  suspendUser,
  activateUser,
  changeUserMembership,
  bulkDeleteQuestions,
  bulkUpdateQuestions,
  importQuestions,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Secure all admin endpoints - requires Admin role!
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', getStats);

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/users/:id (detailed metrics)
router.get('/users/:id', getUserDetail);

// PUT /api/admin/users/:id
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', resetUserPassword);

// POST /api/admin/users/:id/suspend
router.post('/users/:id/suspend', suspendUser);

// POST /api/admin/users/:id/activate
router.post('/users/:id/activate', activateUser);

// POST /api/admin/users/:id/membership
router.post('/users/:id/membership', changeUserMembership);

// GET /api/admin/notifications
router.get('/notifications', getNotifications);

// POST /api/admin/notifications/:id/read
router.post('/notifications/:id/read', markNotificationRead);

// DELETE /api/admin/notifications
router.delete('/notifications', clearNotifications);

// PUT /api/admin/plans/:id
router.put('/plans/:id', updatePlan);

// GET /api/admin/payments
router.get('/payments', getAdminPayments);

// POST /api/admin/payments/:id/approve
router.post('/payments/:id/approve', approvePayment);

// POST /api/admin/payments/:id/reject
router.post('/payments/:id/reject', rejectPayment);

// POST /api/admin/questions/bulk-delete
router.post('/questions/bulk-delete', bulkDeleteQuestions);

// POST /api/admin/questions/bulk-update
router.post('/questions/bulk-update', bulkUpdateQuestions);

// POST /api/admin/questions/import
router.post('/questions/import', importQuestions);

export default router;

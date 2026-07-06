import { Response, NextFunction } from 'express';
import db from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Get available plans (English & Amharic translations will be handled by the client)
export const getPlans = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plansRes = await db.query('SELECT * FROM plans WHERE is_active = true ORDER BY price ASC');
    res.status(200).json({
      success: true,
      data: plansRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Submit payment request (for Telebirr or CBE Birr)
export const submitPaymentRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { plan_id, payment_method, reference_number, screenshot_url } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  if (!plan_id || !payment_method || !reference_number) {
    res.status(400).json({ success: false, message: 'Please provide plan, payment method, and reference number' });
    return;
  }

  try {
    // Check if the plan exists
    const planRes = await db.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    if (planRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    const plan = planRes.rows[0];

    // Check if reference number is already used
    const refCheck = await db.query('SELECT * FROM payment_requests WHERE reference_number = $1', [reference_number]);
    if (refCheck.rows.length > 0) {
      res.status(400).json({ success: false, message: 'This reference number has already been submitted' });
      return;
    }

    // Insert payment request as Pending
    const newRequest = await db.query(
      `INSERT INTO payment_requests (user_id, plan_id, payment_method, reference_number, screenshot_url, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending') RETURNING *`,
      [userId, plan_id, payment_method, reference_number, screenshot_url || null]
    );

    // Get user details for notification
    const userRes = await db.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // Create system notification for admins
    await db.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES (NULL, 'payment_submitted', $1)`,
      [`New payment request of ${plan.price} ETB submitted by ${user.first_name} ${user.last_name} (${user.email}) via ${payment_method}. Ref: ${reference_number}`]
    );

    res.status(201).json({
      success: true,
      message: 'Payment request submitted successfully! An administrator will review and approve your payment shortly.',
      data: newRequest.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get user's own payment request history and active membership status
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    // Get requests
    const requestsRes = await db.query(
      `SELECT pr.*, p.name as plan_name, p.price as plan_price
       FROM payment_requests pr
       JOIN plans p ON pr.plan_id = p.id
       WHERE pr.user_id = $1
       ORDER BY pr.created_at DESC`,
      [userId]
    );

    // Get current active membership
    const membershipRes = await db.query(
      `SELECT um.*, p.name as plan_name, p.price as plan_price
       FROM user_memberships um
       JOIN plans p ON um.plan_id = p.id
       WHERE um.user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        membership: membershipRes.rows[0] || null,
        history: requestsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

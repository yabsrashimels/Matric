import db from '../config/db';

export const PREMIUM_PLAN_PRICE = 100;
export const ADVANCED_PLAN_PRICE = 500;

export type AccessTier = 'free' | 'premium' | 'advanced';

export async function getUserAccessTier(userId: number, role?: string): Promise<AccessTier> {
  if (role === 'admin') return 'advanced';

  const membershipRes = await db.query(
    `SELECT p.price
     FROM user_memberships um
     JOIN plans p ON um.plan_id = p.id
     WHERE um.user_id = $1 AND lower(COALESCE(um.status, 'active')) = 'active'`,
    [userId]
  );

  let maxPrice = 0;
  for (const row of membershipRes.rows) {
    const price = parseFloat(row.price);
    if (!Number.isNaN(price)) maxPrice = Math.max(maxPrice, price);
  }

  if (maxPrice >= ADVANCED_PLAN_PRICE) return 'advanced';
  if (maxPrice >= PREMIUM_PLAN_PRICE) return 'premium';

  const receiptRes = await db.query(
    `SELECT pr.amount
     FROM payment_receipts pr
     LEFT JOIN payment_requests preq ON pr.payment_request_id = preq.id
     WHERE pr.user_id = $1 AND (preq.id IS NULL OR lower(COALESCE(preq.status, '')) = 'approved')`,
    [userId]
  );

  for (const row of receiptRes.rows) {
    const amount = parseFloat(row.amount);
    if (!Number.isNaN(amount)) maxPrice = Math.max(maxPrice, amount);
  }

  const paymentRequestRes = await db.query(
    `SELECT p.price
     FROM payment_requests preq
     JOIN plans p ON preq.plan_id = p.id
     WHERE preq.user_id = $1 AND lower(COALESCE(preq.status, '')) = 'approved'`,
    [userId]
  );

  for (const row of paymentRequestRes.rows) {
    const price = parseFloat(row.price);
    if (!Number.isNaN(price)) maxPrice = Math.max(maxPrice, price);
  }

  if (maxPrice >= ADVANCED_PLAN_PRICE) return 'advanced';
  if (maxPrice >= PREMIUM_PLAN_PRICE) return 'premium';
  return 'free';
}

export async function userHasPremiumAccess(userId: number, role?: string): Promise<boolean> {
  const tier = await getUserAccessTier(userId, role);
  return tier === 'premium' || tier === 'advanced';
}

export async function userHasAdvancedAccess(userId: number, role?: string): Promise<boolean> {
  const tier = await getUserAccessTier(userId, role);
  return tier === 'advanced';
}

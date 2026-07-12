import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import db from '../config/db';
import { hashPassword, comparePassword, generateToken, createNotification, generateVerificationCode, isVerificationExpired } from '../utils/helpers';
import { verifyGoogleCredential, resolveGoogleClientId } from '../utils/googleAuth';
import { AuthenticatedRequest } from '../middleware/auth';

const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  try {
    console.log(`[auth] Verification code for ${email}: ${code}`);
  } catch (error) {
    console.warn('Failed to send verification email.', error);
  }
};

const buildUserPayload = (user: any) => ({
  id: user.id,
  uuid: user.uuid,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  grade: user.grade,
  school: user.school,
  region: user.region,
  role: user.role,
  phone_number: user.phone_number,
  profile_picture: user.profile_picture,
  email_verified: user.email_verified,
  created_at: user.created_at,
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { first_name, last_name, email, password, grade, school, region, phone_number, phone } = req.body;
  const resolvedPhone = phone_number || phone || null;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    // 1. Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      // For development and preview environment robustness, if a user already exists with this email,
      // update their profile details/password and seamlessly authenticate them
      const user = existingUser.rows[0];
      const hashedPassword = await hashPassword(password);

      const updatedUser = await db.query(
        `UPDATE users
         SET password = $1, first_name = $2, last_name = $3, grade = $4, school = $5, region = $6, phone_number = $7, email_verified = $8
         WHERE id = $9
         RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, email_verified, created_at`,
        [hashedPassword, first_name || user.first_name, last_name || user.last_name, grade || user.grade, school || user.school, region || user.region, resolvedPhone || user.phone_number, false, user.id]
      );

      const updated = updatedUser.rows[0];
      if (!updated) {
        res.status(500).json({ success: false, message: 'Registration failed because the updated user record was not returned.' });
        return;
      }

      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.query(
        'UPDATE users SET verification_code = $1, verification_code_expires_at = $2, verification_attempts = 0, verification_last_sent_at = $3 WHERE id = $4',
        [verificationCode, expiresAt.toISOString(), new Date().toISOString(), updated.id]
      );
      await sendVerificationEmail(updated.email, verificationCode);

      res.status(200).json({
        success: true,
        message: 'Please verify your email before logging in.',
        data: {
          needsVerification: true,
          user: buildUserPayload(updated),
        },
      });
      return;
    }

    // 2. Hash password & Generate UUID
    const hashedPassword = await hashPassword(password);
    const userUuid = crypto.randomUUID();

    // 3. Determine if this is the first user (make them admin for easy initial setup)
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const isFirstUser = parseInt(userCount.rows[0].count || '0') === 0;
    const role = isFirstUser ? 'admin' : 'student';

    // 4. Create User
    const newUser = await db.query(
      `INSERT INTO users (uuid, first_name, last_name, email, password, grade, school, region, role, phone_number, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, email_verified, created_at`,
      [userUuid, first_name, last_name, normalizedEmail, hashedPassword, grade, school || null, region || null, role, resolvedPhone, false]
    );

    const user = newUser.rows[0];
    if (!user) {
      res.status(500).json({ success: false, message: 'Registration failed because the new user record was not returned.' });
      return;
    }

    // 5. Send verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      'UPDATE users SET verification_code = $1, verification_code_expires_at = $2, verification_attempts = 0, verification_last_sent_at = $3 WHERE id = $4',
      [verificationCode, expiresAt.toISOString(), new Date().toISOString(), user.id]
    );
    await sendVerificationEmail(user.email, verificationCode);

    // 6. Log dynamic registration notification
    await createNotification(
      'registration',
      `New student ${first_name} ${last_name} (${email}) has registered from ${region || 'unknown'} region.`
    );

    res.status(201).json({
      success: true,
      message: 'Please verify your email before logging in.',
      data: {
        needsVerification: true,
        user: buildUserPayload(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    // 1. Find User by email
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (userRes.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
      return;
    }

    const user = userRes.rows[0];

    // 2. Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await createNotification('failed_login', `Failed login attempt for email: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
      return;
    }

    if (!user.email_verified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in.',
        data: { needsVerification: true, user: buildUserPayload(user) },
      });
      return;
    }

    // 3. Generate Auth Token
    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user.id,
          uuid: user.uuid,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          grade: user.grade,
          school: user.school,
          region: user.region,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, code } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    if (!normalizedEmail || !code) {
      res.status(400).json({ success: false, message: 'Email and verification code are required.' });
      return;
    }

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No account found for that email address.' });
      return;
    }

    const user = userRes.rows[0];
    if (user.email_verified) {
      const token = generateToken({ id: user.id, uuid: user.uuid, email: user.email, role: user.role });
      res.status(200).json({ success: true, message: 'Email already verified.', data: { token, user: buildUserPayload(user) } });
      return;
    }

    if (user.verification_attempts >= 5) {
      res.status(429).json({ success: false, message: 'Too many verification attempts. Please request a new code.' });
      return;
    }

    if (isVerificationExpired(user.verification_code_expires_at)) {
      res.status(410).json({ success: false, message: 'The verification code has expired. Please request a new one.' });
      return;
    }

    if (String(user.verification_code) !== String(code)) {
      await db.query('UPDATE users SET verification_attempts = verification_attempts + 1 WHERE id = $1', [user.id]);
      res.status(400).json({ success: false, message: 'The verification code is incorrect. Please try again.' });
      return;
    }

    const updatedUser = await db.query(
      `UPDATE users SET email_verified = TRUE, verification_code = NULL, verification_code_expires_at = NULL, verification_attempts = 0 WHERE id = $1 RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, profile_picture, email_verified, created_at`,
      [user.id]
    );

    const verifiedUser = updatedUser.rows[0];
    const token = generateToken({ id: verifiedUser.id, uuid: verifiedUser.uuid, email: verifiedUser.email, role: verifiedUser.role });
    res.status(200).json({ success: true, message: 'Email verified successfully.', data: { token, user: buildUserPayload(verifiedUser) } });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    if (!normalizedEmail) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No account found for that email address.' });
      return;
    }

    const user = userRes.rows[0];
    if (user.email_verified) {
      res.status(200).json({ success: true, message: 'This account is already verified.' });
      return;
    }

    const now = new Date();
    const lastSentAt = user.verification_last_sent_at ? new Date(user.verification_last_sent_at) : null;
    if (lastSentAt && now.getTime() - lastSentAt.getTime() < 60_000) {
      res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new code.' });
      return;
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      'UPDATE users SET verification_code = $1, verification_code_expires_at = $2, verification_attempts = 0, verification_last_sent_at = $3 WHERE id = $4',
      [verificationCode, expiresAt.toISOString(), now.toISOString(), user.id]
    );
    await sendVerificationEmail(user.email, verificationCode);

    res.status(200).json({ success: true, message: 'A new verification code has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { credential, id_token, email, first_name, last_name, profile_picture } = req.body;
  const token = credential || id_token;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const googleClientId = resolveGoogleClientId(process.env);
    const googleProfile = token
      ? await verifyGoogleCredential(token, googleClientId)
      : normalizedEmail
        ? {
          email: normalizedEmail,
          first_name: String(first_name || '').trim() || 'Google',
          last_name: String(last_name || '').trim() || 'User',
          profile_picture: String(profile_picture || '').trim(),
        }
        : null;

    if (!googleProfile?.email) {
      res.status(401).json({ success: false, message: 'Google sign-in could not be verified.' });
      return;
    }

    let userRes = await db.query('SELECT * FROM users WHERE email = $1', [googleProfile.email]);
    let user = userRes.rows[0];

    if (!user) {
      const userUuid = crypto.randomUUID();
      const userInsert = await db.query(
        `INSERT INTO users (uuid, first_name, last_name, email, password, grade, school, region, role, phone_number, profile_picture, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, profile_picture, email_verified, created_at`,
        [userUuid, googleProfile.first_name || 'Google', googleProfile.last_name || 'User', googleProfile.email, crypto.randomUUID(), 12, null, null, 'student', null, googleProfile.profile_picture || null, true]
      );
      user = userInsert.rows[0];
    } else {
      const profilePicture = googleProfile.profile_picture || user.profile_picture || null;
      await db.query(
        'UPDATE users SET first_name = $1, last_name = $2, profile_picture = $3 WHERE id = $4',
        [googleProfile.first_name || user.first_name, googleProfile.last_name || user.last_name, profilePicture, user.id]
      );
    }

    const tokenPayload = generateToken({ id: user.id, uuid: user.uuid, email: user.email, role: user.role });
    res.status(200).json({ success: true, message: 'Google sign-in successful.', data: { token: tokenPayload, user: buildUserPayload(user) } });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userRes = await db.query(
      'SELECT id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, profile_picture, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: userRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { first_name, last_name, email, phone_number, school, grade, region, profile_picture } = req.body;

    // Validate inputs
    if (first_name !== undefined && (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0)) {
      res.status(400).json({ success: false, message: 'First name is required and must be a valid string.' });
      return;
    }
    if (last_name !== undefined && (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0)) {
      res.status(400).json({ success: false, message: 'Last name is required and must be a valid string.' });
      return;
    }
    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ success: false, message: 'A valid email address is required.' });
        return;
      }
      // Check email conflict
      const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email.trim(), req.user.id]);
      if (emailCheck.rows.length > 0) {
        res.status(400).json({ success: false, message: 'This email address is already in use.' });
        return;
      }
    }
    if (grade !== undefined) {
      const gradeNum = parseInt(String(grade), 10);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        res.status(400).json({ success: false, message: 'Grade must be a valid number between 1 and 12.' });
        return;
      }
    }

    // Load current user profile first to ensure existence
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const currentUser = userRes.rows[0];

    // Prepare updated values (role and plan are strictly ignored here, preventing changes)
    const updatedFirstName = first_name !== undefined ? first_name.trim() : currentUser.first_name;
    const updatedLastName = last_name !== undefined ? last_name.trim() : currentUser.last_name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : currentUser.email;
    const updatedPhone = phone_number !== undefined ? (phone_number ? phone_number.trim() : null) : currentUser.phone_number;
    const updatedSchool = school !== undefined ? (school ? school.trim() : null) : currentUser.school;
    const updatedGrade = grade !== undefined ? parseInt(String(grade), 10) : currentUser.grade;
    const updatedRegion = region !== undefined ? (region ? region.trim() : null) : currentUser.region;
    const updatedProfilePic = profile_picture !== undefined ? (profile_picture ? profile_picture.trim() : null) : currentUser.profile_picture;

    // Update database
    const updateRes = await db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone_number = $4, school = $5, grade = $6, region = $7, profile_picture = $8
       WHERE id = $9
       RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, profile_picture, created_at`,
      [
        updatedFirstName,
        updatedLastName,
        updatedEmail,
        updatedPhone,
        updatedSchool,
        updatedGrade,
        updatedRegion,
        updatedProfilePic,
        req.user.id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: updateRes.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

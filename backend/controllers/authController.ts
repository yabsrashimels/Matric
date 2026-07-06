import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import db from '../config/db';
import { hashPassword, comparePassword, generateToken, createNotification } from '../utils/helpers';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { first_name, last_name, email, password, grade, school, region, phone_number, phone } = req.body;
  const resolvedPhone = phone_number || phone || null;

  try {
    // 1. Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      // For development and preview environment robustness, if a user already exists with this email,
      // update their profile details/password and seamlessly authenticate them
      const user = existingUser.rows[0];
      const hashedPassword = await hashPassword(password);
      
      const updatedUser = await db.query(
        `UPDATE users
         SET password = $1, first_name = $2, last_name = $3, grade = $4, school = $5, region = $6, phone_number = $7
         WHERE id = $8
         RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, created_at`,
        [hashedPassword, first_name || user.first_name, last_name || user.last_name, grade || user.grade, school || user.school, region || user.region, resolvedPhone || user.phone_number, user.id]
      );
      
      const updated = updatedUser.rows[0];
      const token = generateToken({
        id: updated.id,
        uuid: updated.uuid,
        email: updated.email,
        role: updated.role,
      });

      res.status(200).json({
        success: true,
        message: 'User registered successfully!',
        data: {
          token,
          user: {
            id: updated.id,
            uuid: updated.uuid,
            first_name: updated.first_name,
            last_name: updated.last_name,
            email: updated.email,
            grade: updated.grade,
            school: updated.school,
            region: updated.region,
            role: updated.role,
            phone_number: updated.phone_number,
            created_at: updated.created_at,
          },
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
      `INSERT INTO users (uuid, first_name, last_name, email, password, grade, school, region, role, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, uuid, first_name, last_name, email, grade, school, region, role, phone_number, created_at`,
      [userUuid, first_name, last_name, email, hashedPassword, grade, school || null, region || null, role, resolvedPhone]
    );

    const user = newUser.rows[0];

    // 5. Generate Auth Token
    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });

    // 6. Log dynamic registration notification
    await createNotification(
      'registration',
      `New student ${first_name} ${last_name} (${email}) has registered from ${region || 'unknown'} region.`
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
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
          phone_number: user.phone_number,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    // 1. Find User by email
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
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

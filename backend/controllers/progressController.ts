import { Request, Response, NextFunction } from 'express';
import db from '../config/db';

export const getProgressByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  try {
    const progressRes = await db.query(
      `SELECT p.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon
       FROM progress p
       JOIN subjects s ON p.subject_id = s.id
       WHERE p.user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'User progress retrieved successfully',
      data: progressRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id, subject_id, is_correct } = req.body;

  if (!user_id || !subject_id) {
    res.status(400).json({
      success: false,
      message: 'User ID and Subject ID are required fields.',
    });
    return;
  }

  try {
    // 1. Check if progress record exists for this user and subject
    const existingRes = await db.query(
      'SELECT * FROM progress WHERE user_id = $1 AND subject_id = $2',
      [user_id, subject_id]
    );

    let result;

    if (existingRes.rows.length === 0) {
      // Create new record
      const completed = 1;
      const correct = is_correct ? 1 : 0;
      const wrong = is_correct ? 0 : 1;
      const accuracy = (correct / completed) * 100;

      result = await db.query(
        `INSERT INTO progress (user_id, subject_id, completed_questions, correct_answers, wrong_answers, accuracy, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *`,
        [user_id, subject_id, completed, correct, wrong, accuracy]
      );
    } else {
      // Update existing record
      const current = existingRes.rows[0];
      const completed = (parseInt(current.completed_questions || '0')) + 1;
      const correct = (parseInt(current.correct_answers || '0')) + (is_correct ? 1 : 0);
      const wrong = (parseInt(current.wrong_answers || '0')) + (is_correct ? 0 : 1);
      const accuracy = Math.round((correct / completed) * 10000) / 100; // Round to 2 decimals

      result = await db.query(
        `UPDATE progress 
         SET completed_questions = $1,
             correct_answers = $2,
             wrong_answers = $3,
             accuracy = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5 AND subject_id = $6 RETURNING *`,
        [completed, correct, wrong, accuracy, user_id, subject_id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'User progress updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

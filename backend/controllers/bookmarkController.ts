import { Request, Response, NextFunction } from 'express';
import db from '../config/db';

export const getBookmarksByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  try {
    const bookmarksRes = await db.query(
      `SELECT b.*, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.year, q.difficulty, s.name as subject_name
       FROM bookmarks b
       JOIN questions q ON b.question_id = q.id
       JOIN subjects s ON q.subject_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Bookmarks retrieved successfully',
      data: bookmarksRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const addBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id, question_id } = req.body;

  if (!user_id || !question_id) {
    res.status(400).json({
      success: false,
      message: 'User ID and Question ID are required fields.',
    });
    return;
  }

  try {
    // Check if question exists
    const qCheck = await db.query('SELECT * FROM questions WHERE id = $1', [question_id]);
    if (qCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }

    // Check if already bookmarked. If so, return existing
    const existing = await db.query('SELECT * FROM bookmarks WHERE user_id = $1 AND question_id = $2', [user_id, question_id]);
    if (existing.rows.length > 0) {
      res.status(200).json({
        success: true,
        message: 'Question is already bookmarked.',
        data: existing.rows[0],
      });
      return;
    }

    const result = await db.query(
      'INSERT INTO bookmarks (user_id, question_id) VALUES ($1, $2) RETURNING *',
      [user_id, question_id]
    );

    res.status(201).json({
      success: true,
      message: 'Question bookmarked successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await db.query('SELECT * FROM bookmarks WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
      return;
    }

    await db.query('DELETE FROM bookmarks WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Bookmark helper (extremely useful for React Frontend)
export const toggleBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id, question_id } = req.body;

  if (!user_id || !question_id) {
    res.status(400).json({
      success: false,
      message: 'User ID and Question ID are required.',
    });
    return;
  }

  try {
    const existing = await db.query('SELECT * FROM bookmarks WHERE user_id = $1 AND question_id = $2', [user_id, question_id]);
    
    if (existing.rows.length > 0) {
      // Delete it
      await db.query('DELETE FROM bookmarks WHERE id = $1', [existing.rows[0].id]);
      res.status(200).json({
        success: true,
        message: 'Bookmark removed successfully',
        data: { bookmarked: false },
      });
    } else {
      // Add it
      const result = await db.query(
        'INSERT INTO bookmarks (user_id, question_id) VALUES ($1, $2) RETURNING *',
        [user_id, question_id]
      );
      res.status(201).json({
        success: true,
        message: 'Bookmark added successfully',
        data: { bookmarked: true, bookmark: result.rows[0] },
      });
    }
  } catch (error) {
    next(error);
  }
};

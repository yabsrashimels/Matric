import { Request, Response, NextFunction } from 'express';
import db from '../config/db';

export const getTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topicsRes = await db.query(
      `SELECT t.*, s.name as subject_name 
       FROM topics t
       JOIN subjects s ON t.subject_id = s.id
       ORDER BY t.subject_id ASC, t.id ASC`
    );
    res.status(200).json({
      success: true,
      message: 'Topics retrieved successfully',
      data: topicsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const topicRes = await db.query(
      `SELECT t.*, s.name as subject_name 
       FROM topics t
       JOIN subjects s ON t.subject_id = s.id
       WHERE t.id = $1`,
      [id]
    );
    if (topicRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Topic retrieved successfully',
      data: topicRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { subject_id, name } = req.body;
  try {
    // Check if subject exists
    const subjectCheck = await db.query('SELECT * FROM subjects WHERE id = $1', [subject_id]);
    if (subjectCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subject not found. Cannot create topic for a non-existent subject.',
      });
      return;
    }

    // Check if topic name already exists for this subject
    const existing = await db.query('SELECT * FROM topics WHERE subject_id = $1 AND name = $2', [subject_id, name]);
    if (existing.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'A topic with this name already exists in this subject.',
      });
      return;
    }

    const result = await db.query(
      'INSERT INTO topics (subject_id, name) VALUES ($1, $2) RETURNING *',
      [subject_id, name]
    );

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { subject_id, name } = req.body;
  try {
    const checkTopic = await db.query('SELECT * FROM topics WHERE id = $1', [id]);
    if (checkTopic.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
      return;
    }

    const targetSubjectId = subject_id || checkTopic.rows[0].subject_id;
    const targetName = name || checkTopic.rows[0].name;

    // Check if duplicate
    if (subject_id || name) {
      const existing = await db.query(
        'SELECT * FROM topics WHERE subject_id = $1 AND name = $2 AND id != $3',
        [targetSubjectId, targetName, id]
      );
      if (existing.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: 'A topic with this name already exists in this subject.',
        });
        return;
      }
    }

    const updated = await db.query(
      `UPDATE topics 
       SET subject_id = $1, 
           name = $2
       WHERE id = $3 RETURNING *`,
      [targetSubjectId, targetName, id]
    );

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const checkTopic = await db.query('SELECT * FROM topics WHERE id = $1', [id]);
    if (checkTopic.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
      return;
    }

    await db.query('DELETE FROM topics WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

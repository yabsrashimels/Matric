import { Request, Response, NextFunction } from 'express';
import db from '../config/db';

export const getSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subjectsRes = await db.query('SELECT * FROM subjects ORDER BY id ASC');
    res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: subjectsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const subjectRes = await db.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (subjectRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Subject retrieved successfully',
      data: subjectRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, description, icon, color } = req.body;
  try {
    const existing = await db.query('SELECT * FROM subjects WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'A subject with this name already exists',
      });
      return;
    }

    const result = await db.query(
      'INSERT INTO subjects (name, description, icon, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, icon || 'BookOpen', color || '#078930']
    );

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { name, description, icon, color } = req.body;
  try {
    const checkSubject = await db.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (checkSubject.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
      return;
    }

    // Check unique name if changing name
    if (name && name !== checkSubject.rows[0].name) {
      const existing = await db.query('SELECT * FROM subjects WHERE name = $1', [name]);
      if (existing.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: 'A subject with this name already exists',
        });
        return;
      }
    }

    const updated = await db.query(
      `UPDATE subjects 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           icon = COALESCE($3, icon), 
           color = COALESCE($4, color)
       WHERE id = $5 RETURNING *`,
      [name, description, icon, color, id]
    );

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const checkSubject = await db.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (checkSubject.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
      return;
    }

    await db.query('DELETE FROM subjects WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

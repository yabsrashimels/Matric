import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import { createNotification } from '../utils/helpers';

export const getMockExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const examsRes = await db.query('SELECT * FROM mock_exams ORDER BY id DESC');
    res.status(200).json({
      success: true,
      message: 'Mock exams retrieved successfully',
      data: examsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getMockExamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const examRes = await db.query('SELECT * FROM mock_exams WHERE id = $1', [id]);
    if (examRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mock exam not found',
      });
      return;
    }

    const exam = examRes.rows[0];

    // Fetch associated questions
    const questionsRes = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN mock_exam_questions meq ON q.id = meq.question_id
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE meq.mock_exam_id = $1
       ORDER BY q.id ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Mock exam retrieved successfully with questions',
      data: {
        ...exam,
        questions: questionsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createMockExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { title, duration, total_questions, question_ids } = req.body;

  if (!title || !duration || !total_questions) {
    res.status(400).json({
      success: false,
      message: 'Title, duration, and total questions are required fields.',
    });
    return;
  }

  try {
    // 1. Insert Exam
    const examRes = await db.query(
      'INSERT INTO mock_exams (title, duration, total_questions) VALUES ($1, $2, $3) RETURNING *',
      [title, duration, total_questions]
    );

    const exam = examRes.rows[0];

    // 2. Link questions if provided
    if (question_ids && Array.isArray(question_ids)) {
      for (const qId of question_ids) {
        await db.query(
          'INSERT INTO mock_exam_questions (mock_exam_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [exam.id, qId]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Mock exam created successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

export const startMockExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id, mock_exam_id } = req.body;
  if (!user_id || !mock_exam_id) {
    res.status(400).json({
      success: false,
      message: 'User ID and Mock Exam ID are required to start an exam.',
    });
    return;
  }

  try {
    // Return successfully as started indicator
    res.status(200).json({
      success: true,
      message: 'Mock exam session started successfully.',
      data: {
        user_id,
        mock_exam_id,
        started_at: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitMockExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id, mock_exam_id, score, total_questions } = req.body;

  if (!user_id || !mock_exam_id || score === undefined || !total_questions) {
    res.status(400).json({
      success: false,
      message: 'User ID, Mock Exam ID, score, and total questions are required.',
    });
    return;
  }

  try {
    // 1. Calculate percentage
    const percentage = Math.round((score / total_questions) * 10000) / 100;

    // 2. Save result
    const resultRes = await db.query(
      `INSERT INTO exam_results (user_id, mock_exam_id, score, percentage)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, mock_exam_id, score, percentage]
    );

    // 3. Fetch names for rich notification logs
    const userRes = await db.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [user_id]);
    const examRes = await db.query('SELECT title FROM mock_exams WHERE id = $1', [mock_exam_id]);

    const userName = userRes.rows.length > 0 ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Unknown Student';
    const userEmail = userRes.rows.length > 0 ? userRes.rows[0].email : '';
    const examTitle = examRes.rows.length > 0 ? examRes.rows[0].title : 'Mock Exam';

    await createNotification(
      'exam_submit',
      `Student ${userName} (${userEmail}) submitted ${examTitle} exam with score ${score}/${total_questions} (${percentage}%).`
    );

    res.status(201).json({
      success: true,
      message: 'Mock exam results submitted successfully!',
      data: resultRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import db from '../config/db';

export const submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id, question_id, selected_answer } = req.body;

  if (!user_id || !question_id || !selected_answer) {
    res.status(400).json({
      success: false,
      message: 'User ID, Question ID, and Selected Answer are required fields.',
    });
    return;
  }

  try {
    // 1. Fetch the question to check the correct answer
    const qRes = await db.query('SELECT correct_answer, subject_id FROM questions WHERE id = $1', [question_id]);
    if (qRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
      return;
    }

    const { correct_answer, subject_id } = qRes.rows[0];
    const is_correct = selected_answer.trim().toUpperCase() === correct_answer.trim().toUpperCase();

    // 2. Check if user already answered this question
    const existingAnswer = await db.query(
      'SELECT id, is_correct FROM user_answers WHERE user_id = $1 AND question_id = $2',
      [user_id, question_id]
    );

    let answerResult;

    if (existingAnswer.rows.length > 0) {
      // Re-answering: update the answer
      answerResult = await db.query(
        `UPDATE user_answers 
         SET selected_answer = $1, is_correct = $2, answered_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [selected_answer, is_correct, existingAnswer.rows[0].id]
      );

      // If the correctness changed, we need to adjust progress stats!
      const wasCorrect = existingAnswer.rows[0].is_correct;
      if (wasCorrect !== is_correct) {
        const correctDiff = is_correct ? 1 : -1;
        const wrongDiff = is_correct ? -1 : 1;

        // Fetch current progress
        const progRes = await db.query('SELECT * FROM progress WHERE user_id = $1 AND subject_id = $2', [user_id, subject_id]);
        if (progRes.rows.length > 0) {
          const curr = progRes.rows[0];
          const completed = parseInt(curr.completed_questions || '0');
          const correct = Math.max(0, parseInt(curr.correct_answers || '0') + correctDiff);
          const wrong = Math.max(0, parseInt(curr.wrong_answers || '0') + wrongDiff);
          const accuracy = completed > 0 ? Math.round((correct / completed) * 10000) / 100 : 0;

          await db.query(
            `UPDATE progress 
             SET correct_answers = $1, wrong_answers = $2, accuracy = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [correct, wrong, accuracy, curr.id]
          );
        }
      }
    } else {
      // New answer
      answerResult = await db.query(
        `INSERT INTO user_answers (user_id, question_id, selected_answer, is_correct)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user_id, question_id, selected_answer, is_correct]
      );

      // Fetch existing progress
      const progRes = await db.query('SELECT * FROM progress WHERE user_id = $1 AND subject_id = $2', [user_id, subject_id]);

      if (progRes.rows.length === 0) {
        const completed = 1;
        const correct = is_correct ? 1 : 0;
        const wrong = is_correct ? 0 : 1;
        const accuracy = is_correct ? 100.0 : 0.0;

        await db.query(
          `INSERT INTO progress (user_id, subject_id, completed_questions, correct_answers, wrong_answers, accuracy)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user_id, subject_id, completed, correct, wrong, accuracy]
        );
      } else {
        const curr = progRes.rows[0];
        const completed = parseInt(curr.completed_questions || '0') + 1;
        const correct = parseInt(curr.correct_answers || '0') + (is_correct ? 1 : 0);
        const wrong = parseInt(curr.wrong_answers || '0') + (is_correct ? 0 : 1);
        const accuracy = Math.round((correct / completed) * 10000) / 100;

        await db.query(
          `UPDATE progress 
           SET completed_questions = $1, correct_answers = $2, wrong_answers = $3, accuracy = $4, updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [completed, correct, wrong, accuracy, curr.id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        answer: answerResult.rows[0],
        is_correct,
        correct_answer,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnswersByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  try {
    const answersRes = await db.query(
      `SELECT ua.*, q.question, q.correct_answer, q.explanation, q.year, s.name as subject_name
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       JOIN subjects s ON q.subject_id = s.id
       WHERE ua.user_id = $1
       ORDER BY ua.answered_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'User answers retrieved successfully',
      data: answersRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

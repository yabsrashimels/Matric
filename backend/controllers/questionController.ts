import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { subject, topic, difficulty, year, page = '1', limit = '10', sort } = req.query;

  try {
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (subject) {
      whereClauses.push(`q.subject_id = $${paramIndex++}`);
      params.push(parseInt(subject as string));
    }
    if (topic) {
      whereClauses.push(`q.topic_id = $${paramIndex++}`);
      params.push(parseInt(topic as string));
    }
    if (difficulty) {
      whereClauses.push(`q.difficulty = $${paramIndex++}`);
      params.push(difficulty as string);
    }
    if (year) {
      whereClauses.push(`q.year = $${paramIndex++}`);
      params.push(parseInt(year as string));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sorting
    let orderBySql = 'ORDER BY q.id DESC'; // default newest by insertion ID
    if (sort) {
      switch (sort as string) {
        case 'Newest':
          orderBySql = 'ORDER BY q.year DESC, q.id DESC';
          break;
        case 'Oldest':
          orderBySql = 'ORDER BY q.year ASC, q.id ASC';
          break;
        case 'Difficulty':
          // Custom sort order for difficulty
          orderBySql = `ORDER BY CASE q.difficulty 
            WHEN 'Easy' THEN 1 
            WHEN 'Medium' THEN 2 
            WHEN 'Hard' THEN 3 
            ELSE 4 END ASC`;
          break;
        case 'Year':
          orderBySql = 'ORDER BY q.year DESC';
          break;
      }
    }

    // Run count query
    const countSql = `
      SELECT COUNT(*) as total 
      FROM questions q
      ${whereSql}
    `;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0].total || '0');

    // Run paginated query
    // In our db.ts, query uses Postgres parameter mapping. So we can add page & limit as params
    const querySql = `
      SELECT q.*, s.name as subject_name, t.name as topic_name
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN topics t ON q.topic_id = t.id
      ${whereSql}
      ${orderBySql}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const finalParams = [...params, limitNum, offset];
    const questionsRes = await db.query(querySql, finalParams);

    res.status(200).json({
      success: true,
      message: 'Questions retrieved successfully',
      data: {
        questions: questionsRes.rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const questionRes = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.id = $1`,
      [id]
    );

    if (questionRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Question not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Question retrieved successfully',
      data: questionRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const searchQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({
      success: false,
      message: 'Search query parameter (q) is required',
    });
    return;
  }

  try {
    const searchTerm = `%${q}%`;
    const searchSql = `
      SELECT q.*, s.name as subject_name, t.name as topic_name
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      JOIN topics t ON q.topic_id = t.id
      WHERE q.question ILIKE $1 
         OR t.name ILIKE $1 
         OR s.name ILIKE $1
      ORDER BY q.id DESC
      LIMIT 50
    `;

    const results = await db.query(searchSql, [searchTerm]);

    res.status(200).json({
      success: true,
      message: 'Questions search completed successfully',
      data: results.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsBySubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { subjectId } = req.params;
  try {
    const questions = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.subject_id = $1
       ORDER BY q.id ASC`,
      [subjectId]
    );

    res.status(200).json({
      success: true,
      message: 'Questions by subject retrieved successfully',
      data: questions.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { topicId } = req.params;
  try {
    const questions = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.topic_id = $1
       ORDER BY q.id ASC`,
      [topicId]
    );

    res.status(200).json({
      success: true,
      message: 'Questions by topic retrieved successfully',
      data: questions.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { year } = req.params;
  try {
    const questions = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.year = $1
       ORDER BY q.id ASC`,
      [year]
    );

    res.status(200).json({
      success: true,
      message: 'Questions by year retrieved successfully',
      data: questions.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Premium endpoint: return full Q&A for a given year only for users who paid >= 100 ETB
export const getPremiumQuestionsByYear = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { year } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    let authorized = false;
    if (req.user?.role === 'admin') {
      authorized = true;
    } else {
      const membershipRes = await db.query(
        `SELECT p.price
         FROM user_memberships um
         JOIN plans p ON um.plan_id = p.id
         WHERE um.user_id = $1 AND lower(COALESCE(um.status, 'active')) = 'active'`,
        [userId]
      );

      const hasMembership = membershipRes.rows.some((row: any) => {
        const price = parseFloat(row.price);
        return !Number.isNaN(price) && price >= 100;
      });

      if (hasMembership) {
        authorized = true;
      } else {
        const receiptRes = await db.query(
          `SELECT pr.amount
           FROM payment_receipts pr
           LEFT JOIN payment_requests preq ON pr.payment_request_id = preq.id
           WHERE pr.user_id = $1 AND pr.amount >= $2 AND (preq.id IS NULL OR lower(COALESCE(preq.status, '')) = 'approved')`,
          [userId, 100]
        );

        if (receiptRes.rows.length > 0) {
          authorized = true;
        } else {
          const paymentRequestRes = await db.query(
            `SELECT p.price
             FROM payment_requests preq
             JOIN plans p ON preq.plan_id = p.id
             WHERE preq.user_id = $1 AND lower(COALESCE(preq.status, '')) = 'approved' AND p.price >= $2`,
            [userId, 100]
          );

          authorized = paymentRequestRes.rows.length > 0;
        }
      }
    }

    if (!authorized) {
      res.status(402).json({ success: false, message: 'Payment required: this premium content is available only to users who have paid 100 ETB or more.' });
      return;
    }

    // Fetch questions for the requested year and subject Mathematics
    const questionsRes = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.year = $1 AND s.name = 'Mathematics'
       ORDER BY q.id ASC`,
      [year]
    );

    res.status(200).json({ success: true, message: 'Premium questions retrieved', data: questionsRes.rows });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByDifficulty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { difficulty } = req.params;
  try {
    const questions = await db.query(
      `SELECT q.*, s.name as subject_name, t.name as topic_name
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       JOIN topics t ON q.topic_id = t.id
       WHERE q.difficulty = $1
       ORDER BY q.id ASC`,
      [difficulty]
    );

    res.status(200).json({
      success: true,
      message: 'Questions by difficulty retrieved successfully',
      data: questions.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const {
    subject_id,
    topic_id,
    year,
    difficulty,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
    reference,
    hint,
    estimated_time,
  } = req.body;

  try {
    // Validate subject exists
    const subCheck = await db.query('SELECT * FROM subjects WHERE id = $1', [subject_id]);
    if (subCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }

    // Validate topic exists
    const topCheck = await db.query('SELECT * FROM topics WHERE id = $1', [topic_id]);
    if (topCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Topic not found' });
      return;
    }

    const result = await db.query(
      `INSERT INTO questions (
        subject_id, topic_id, year, difficulty, question, 
        option_a, option_b, option_c, option_d, correct_answer, 
        explanation, reference, hint, estimated_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        subject_id,
        topic_id,
        year,
        difficulty,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation || null,
        reference || null,
        hint || null,
        estimated_time || 60,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const {
    subject_id,
    topic_id,
    year,
    difficulty,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
    reference,
    hint,
    estimated_time,
  } = req.body;

  try {
    const qCheck = await db.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (qCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }

    if (subject_id) {
      const subCheck = await db.query('SELECT * FROM subjects WHERE id = $1', [subject_id]);
      if (subCheck.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Subject not found' });
        return;
      }
    }

    if (topic_id) {
      const topCheck = await db.query('SELECT * FROM topics WHERE id = $1', [topic_id]);
      if (topCheck.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Topic not found' });
        return;
      }
    }

    const updated = await db.query(
      `UPDATE questions 
       SET subject_id = COALESCE($1, subject_id),
           topic_id = COALESCE($2, topic_id),
           year = COALESCE($3, year),
           difficulty = COALESCE($4, difficulty),
           question = COALESCE($5, question),
           option_a = COALESCE($6, option_a),
           option_b = COALESCE($7, option_b),
           option_c = COALESCE($8, option_c),
           option_d = COALESCE($9, option_d),
           correct_answer = COALESCE($10, correct_answer),
           explanation = COALESCE($11, explanation),
           reference = COALESCE($12, reference),
           hint = COALESCE($13, hint),
           estimated_time = COALESCE($14, estimated_time)
       WHERE id = $15 RETURNING *`,
      [
        subject_id,
        topic_id,
        year,
        difficulty,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        reference,
        hint,
        estimated_time,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const qCheck = await db.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (qCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }

    await db.query('DELETE FROM questions WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

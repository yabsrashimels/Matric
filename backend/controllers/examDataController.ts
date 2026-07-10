import { Request, Response, NextFunction } from 'express';
import {
  getCatalog,
  getFreePreviewQuestions,
  getSocialChildren,
  getSubjectBySlug,
  loadSocialYearQuestions,
  loadSubjectYearQuestions,
  RawQuestion,
  searchQuestions,
} from '../services/jsonLoaderService';
import { AuthenticatedRequest } from '../middleware/auth';
import { sanitizePathSegment } from '../utils/slugUtils';

function formatQuestion(question: RawQuestion, index: number) {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d].filter(Boolean);
  const correctLetter = String(question.correct_answer || '').toUpperCase();
  const answerIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);

  return {
    id: index + 1,
    subject: question.subject,
    topic: question.topic,
    year: Number(question.year),
    difficulty: question.difficulty,
    question: question.question,
    options,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_answer: correctLetter,
    correctAnswer: answerIndex >= 0 ? options[answerIndex] : options[0],
    explanation: question.explanation || '',
    reference: question.reference || '',
    hint: question.hint || '',
    estimated_time: question.estimated_time || 60,
    time: question.estimated_time ? `${question.estimated_time} seconds` : '60 seconds',
  };
}

export const listCatalogSubjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subjects = getCatalog();
    if (subjects.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No subjects available.',
        data: [],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

export const getCatalogSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const slug = sanitizePathSegment(req.params.slug || '');
  if (!slug) {
    res.status(400).json({ success: false, message: 'Invalid subject identifier.' });
    return;
  }

  try {
    const subject = getSubjectBySlug(slug);
    if (!subject) {
      res.status(404).json({ success: false, message: 'Subject not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subject details retrieved successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectYearQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const slug = sanitizePathSegment(req.params.slug || '');
  const year = parseInt(req.params.year, 10);

  if (!slug || Number.isNaN(year)) {
    res.status(400).json({ success: false, message: 'Invalid subject or year.' });
    return;
  }

  try {
    const subject = getSubjectBySlug(slug);
    if (!subject) {
      res.status(404).json({ success: false, message: 'Subject not found.' });
      return;
    }

    if (subject.type === 'nested') {
      res.status(400).json({
        success: false,
        message: 'This subject has sub-subjects. Use the social stream endpoints.',
      });
      return;
    }

    if (!subject.years.includes(year)) {
      res.status(404).json({ success: false, message: 'Year unavailable for this subject.' });
      return;
    }

    const questions = loadSubjectYearQuestions(slug, year);
    if (questions.length === 0) {
      res.status(404).json({ success: false, message: 'Questions not found.' });
      return;
    }

    const hasPremiumAccess = (req as AuthenticatedRequest & { hasPremiumAccess?: boolean }).hasPremiumAccess;
    const visibleQuestions = hasPremiumAccess ? questions : getFreePreviewQuestions(questions);

    res.status(200).json({
      success: true,
      message: hasPremiumAccess ? 'Questions retrieved successfully' : 'Free preview questions retrieved',
      data: {
        subject: subject.name,
        slug: subject.slug,
        year,
        total: questions.length,
        isPreview: !hasPremiumAccess,
        questions: visibleQuestions.map(formatQuestion),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listSocialSubjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const children = getSocialChildren();
    res.status(200).json({
      success: true,
      message: 'Social stream subjects retrieved successfully',
      data: children,
    });
  } catch (error) {
    next(error);
  }
};

export const getSocialSubjectYears = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const subSubject = sanitizePathSegment(req.params.subSubject || '');
  if (!subSubject) {
    res.status(400).json({ success: false, message: 'Invalid social sub-subject.' });
    return;
  }

  try {
    const child = getSocialChildren().find((item) => item.slug === subSubject.toLowerCase());
    if (!child) {
      res.status(404).json({ success: false, message: 'Social sub-subject not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Years retrieved successfully',
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

export const getSocialYearQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const subSubject = sanitizePathSegment(req.params.subSubject || '');
  const year = parseInt(req.params.year, 10);

  if (!subSubject || Number.isNaN(year)) {
    res.status(400).json({ success: false, message: 'Invalid social stream request.' });
    return;
  }

  try {
    const child = getSocialChildren().find((item) => item.slug === subSubject.toLowerCase());
    if (!child) {
      res.status(404).json({ success: false, message: 'Social sub-subject not found.' });
      return;
    }

    if (!child.years.includes(year)) {
      res.status(404).json({ success: false, message: 'Year unavailable.' });
      return;
    }

    const questions = loadSocialYearQuestions(subSubject, year);
    if (questions.length === 0) {
      res.status(404).json({ success: false, message: 'Questions not found.' });
      return;
    }

    const hasPremiumAccess = (req as AuthenticatedRequest & { hasPremiumAccess?: boolean }).hasPremiumAccess;
    const visibleQuestions = hasPremiumAccess ? questions : getFreePreviewQuestions(questions);

    res.status(200).json({
      success: true,
      message: hasPremiumAccess ? 'Questions retrieved successfully' : 'Free preview questions retrieved',
      data: {
        subject: child.name,
        slug: child.slug,
        parent: 'Social',
        year,
        total: questions.length,
        isPreview: !hasPremiumAccess,
        questions: visibleQuestions.map(formatQuestion),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchExamQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { subject, year, topic, difficulty, q } = req.query;

  try {
    const parsedYear = year ? parseInt(String(year), 10) : undefined;
    const results = searchQuestions({
      subject: subject ? String(subject) : undefined,
      year: parsedYear && !Number.isNaN(parsedYear) ? parsedYear : undefined,
      topic: topic ? String(topic) : undefined,
      difficulty: difficulty ? String(difficulty) : undefined,
      q: q ? String(q) : undefined,
    });

    res.status(200).json({
      success: true,
      message: results.length > 0 ? 'Search completed successfully' : 'No matching questions found.',
      data: {
        total: results.length,
        questions: results.slice(0, 100).map(formatQuestion),
      },
    });
  } catch (error) {
    next(error);
  }
};

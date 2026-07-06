import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';

// Middleware to check validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Return the first error message clearly
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Specific validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be under 50 characters'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be under 50 characters'),
  body('grade')
    .isInt({ min: 9, max: 12 })
    .withMessage('Grade must be an integer between 9 and 12'),
  body('school')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School name must be under 100 characters'),
  body('region')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Region name must be under 100 characters'),
  validateRequest,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];

export const validateQuestion = [
  body('subject_id').isInt().withMessage('Subject ID must be an integer'),
  body('topic_id').isInt().withMessage('Topic ID must be an integer'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Year must be a valid 4-digit integer'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('question').notEmpty().withMessage('Question text is required'),
  body('option_a').notEmpty().withMessage('Option A is required'),
  body('option_b').notEmpty().withMessage('Option B is required'),
  body('option_c').notEmpty().withMessage('Option C is required'),
  body('option_d').notEmpty().withMessage('Option D is required'),
  body('correct_answer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D'),
  validateRequest,
];

export const validateSubject = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('description').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  validateRequest,
];

export const validateTopic = [
  body('subject_id').isInt().withMessage('Subject ID must be an integer'),
  body('name').trim().notEmpty().withMessage('Topic name is required'),
  validateRequest,
];

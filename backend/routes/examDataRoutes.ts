import { Router } from 'express';
import {
  getCatalogSubject,
  getSocialSubjectYears,
  getSocialYearQuestions,
  getSubjectYearQuestions,
  listCatalogSubjects,
  listSocialSubjects,
  searchExamQuestions,
} from '../controllers/examDataController';
import { authenticateToken } from '../middleware/auth';
import { attachAccessInfo, requirePremiumAccess } from '../middleware/payment';

const router = Router();

// Public catalog endpoints (metadata only — no full question bank dump)
router.get('/subjects/search', searchExamQuestions);
router.get('/subjects', listCatalogSubjects);
router.get('/subjects/:slug', getCatalogSubject);

// Protected question endpoints — auth required; full access needs payment
router.get(
  '/subjects/:slug/:year',
  authenticateToken,
  attachAccessInfo,
  getSubjectYearQuestions
);

router.get('/social', listSocialSubjects);
router.get('/social/:subSubject', getSocialSubjectYears);
router.get(
  '/social/:subSubject/:year',
  authenticateToken,
  attachAccessInfo,
  getSocialYearQuestions
);

// Premium search over question content
router.get('/exam-search', authenticateToken, requirePremiumAccess, searchExamQuestions);

export default router;

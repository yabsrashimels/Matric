import { Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

// Route Imports
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import subjectRoutes from './routes/subjectRoutes';
import topicRoutes from './routes/topicRoutes';
import questionRoutes from './routes/questionRoutes';
import progressRoutes from './routes/progressRoutes';
import answerRoutes from './routes/answerRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import mockExamRoutes from './routes/mockExamRoutes';
import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';

const apiRouter = Router();

// Apply global middlewares to the API sub-router
apiRouter.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for easy frontend preview frame compatibility
}));
apiRouter.use(cors({
  origin: '*', // Allow all origins for the development frame preview
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
apiRouter.use(morgan('dev'));

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ethiopian Grade 12 Matric Learning Platform API is healthy and active.',
    timestamp: new Date(),
  });
});

// API Routes Mounting
apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/subjects', subjectRoutes);
apiRouter.use('/topics', topicRoutes);
apiRouter.use('/questions', questionRoutes);
apiRouter.use('/progress', progressRoutes);
apiRouter.use('/answers', answerRoutes);
apiRouter.use('/bookmarks', bookmarkRoutes);
apiRouter.use('/mock-exams', mockExamRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/payments', paymentRoutes);

// Fallback 404 API handler for any unmatched endpoints to always return valid JSON
apiRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

export default apiRouter;

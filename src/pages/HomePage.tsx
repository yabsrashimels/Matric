import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS, QUESTIONS } from '../data/questions';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Target, Shield, Award, Sparkles, Zap, Flame,
  ArrowRight, CheckCircle, GraduationCap, Clock, HelpCircle,
  Users, ChevronDown, ChevronUp, BookOpenCheck, Brain, Star
} from 'lucide-react';

// Animated Stats Counter Component — triggers only when element scrolls into view
const StatsCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        let active = true;
        let start = 0;
        const duration = 1800;
        const increment = Math.ceil(value / (duration / 16));
        const step = () => {
          if (!active) return;
          start += increment;
          if (start >= value) {
            setCount(value);
            setHasAnimated(true);
          } else {
            setCount(start);
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
        return () => { active = false; };
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref} aria-label={`${value.toLocaleString()}${suffix}`}>{count.toLocaleString()}{suffix}</span>;
};

// Pure CSS/SVG Ethiopian Study Desk Illustration Component
const EthiopianStudentIllustration: React.FC = () => {
  return (
    <div className="study-illustration-wrapper">
      {/* Background glowing rings */}
      <div className="glow-ring glow-ring-1"></div>
      <div className="glow-ring glow-ring-2"></div>

      {/* Animated floating icons */}
      <motion.div
        className="floating-icon icon-grad"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <GraduationCap size={28} />
      </motion.div>
      <motion.div
        className="floating-icon icon-book"
        animate={{ y: [0, 12, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <BookOpen size={24} />
      </motion.div>
      <motion.div
        className="floating-icon icon-bulb"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Zap size={22} />
      </motion.div>

      {/* Handcrafted Desk Scene */}
      <div className="desk-scene">
        {/* Computer Monitor */}
        <div className="monitor-stem"></div>
        <div className="monitor-base"></div>
        <div className="monitor-body">
          <div className="monitor-screen">
            <div className="screen-header">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="screen-title">Matric Exam Practice</span>
            </div>
            <div className="screen-content">
              <div className="mock-chart">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
              </div>
              <div className="screen-badge">🇪🇹 MoE Syllabus Sync</div>
              <div className="screen-question-box">
                <div className="box-line-1"></div>
                <div className="box-line-2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stack of books */}
        <div className="books-stack">
          <div className="book book-maths">Mathematics</div>
          <div className="book book-physics">Physics</div>
          <div className="book book-civics">English</div>
        </div>

        {/* Desk items */}
        <div className="desk-lamp">
          <div className="lamp-head"></div>
          <div className="lamp-light"></div>
        </div>

        <div className="desk-surface"></div>
      </div>
    </div>
  );
};

// FAQ Accordion Card Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
      <button
        className="faq-question-row"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.slice(0, 20).replace(/\s+/g, '-')}`}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        <h4>{question}</h4>
        <span className="faq-toggle-icon" aria-hidden="true">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${question.slice(0, 20).replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="faq-answer-container"
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { progress, setActivePage, setSelectedSubject, language, t } = useApp();

  const totalSubjects = SUBJECTS.length;
  const totalQuestions = QUESTIONS.length;
  const completedQuestions = progress.completedQuestionIds.length;
  const progressPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  const startPracticing = () => {
    setSelectedSubject(null);
    setActivePage('practice');
  };

  const startSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setActivePage('practice');
  };

  // Scroll animations variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  } as const;

  return (
    <div className="homepage-enhanced">
      {/* Subtle Interactive Background Blobs */}
      <div className="bg-blob bg-blob-purple"></div>
      <div className="bg-blob bg-blob-teal"></div>
      <div className="bg-blob bg-blob-yellow"></div>

      {/* Hero Section */}
      <section className="hero-section" id="hero-banner">
        <motion.div
          className="hero-text-content"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="hero-badge-pill">
            <Sparkles size={14} className="text-yellow-400" />
            <span>Grade 12 Educational Excellence</span>
          </div>
          <h1 className="hero-title">
            Prepare with Confidence for Ethiopia's <br />
            <span>Grade 12 National Matric</span> Examination
          </h1>
          <p className="hero-subtitle">
            Practice with structured revision, detailed explanations, realistic mock examinations, detailed answer explanations, progress tracking, and curriculum-focused learning designed specifically for Ethiopian Grade 12 students.
          </p>
          <p className="hero-supporting-text">
            Build confidence, strengthen your knowledge, monitor your progress, and maximize your performance before the National Matric Examination.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-glow"
              onClick={() => setActivePage('subjects')}
              aria-label="Start learning — go to Subjects page"
              id="hero-start-learning-btn"
            >
              Start Learning <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-glow"
              onClick={startPracticing}
              aria-label="Explore mock exams — go to Practice page"
              id="hero-mock-exam-btn"
            >
              Explore Mock Exams
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-illustration-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <EthiopianStudentIllustration />
        </motion.div>
      </section>

      {/* Statistics Section */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="section-header-centered">
          <h2 className="section-title">
            <Zap size={22} style={{ color: 'var(--ethio-yellow)' }} /> Live Platform Statistics
          </h2>
          <p className="section-desc">Join thousands of students achieving matric success across Ethiopia</p>
        </div>

        {/* <div className="stats-container stats-enhanced">
          <div className="card stats-card-interactive" id="stat-students">
            <div className="stats-icon-wrapper flex-primary">
              <Users size={24} />
            </div>
            <div className="stats-info">
              <h3><StatsCounter value={50000} suffix="+" /></h3>
              <p>Active Students</p>
            </div>
          </div>

          <div className="card stats-card-interactive" id="stat-mock-exams">
            <div className="stats-icon-wrapper flex-warning">
              <Award size={24} />
            </div>
            <div className="stats-info">
              <h3><StatsCounter value={100} suffix="+" /></h3>
              <p>Full Mock Exams</p>
            </div>
          </div>

          <div className="card stats-card-interactive" id="stat-practice-questions">
            <div className="stats-icon-wrapper flex-accent">
              <BookOpenCheck size={24} />
            </div>
            <div className="stats-info">
              <h3><StatsCounter value={totalQuestions} /></h3>
              <p>Practice Questions</p>
            </div>
          </div>

          <div className="card stats-card-interactive" id="stat-satisfaction">
            <div className="stats-icon-wrapper flex-danger">
              <Flame size={24} />
            </div>
            <div className="stats-info">
              <h3><StatsCounter value={95} suffix="%" /></h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div> */}
      </motion.section>

      {/* Popular Subjects */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={22} style={{ color: 'var(--ethio-green)' }} /> Popular Subjects
            </h2>
            <p className="section-desc">Get started instantly with targeted, curriculum-synced modules</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('subjects')}>
            Explore All Subjects
          </button>
        </div>

        <motion.div className="subjects-grid" variants={staggerContainer}>
          {SUBJECTS.slice(0, 3).map((sub, i) => {
            const solvedStats = progress.subjectProgress[sub.name] || { answered: 0, correct: 0 };
            const percentSolved = Math.round((solvedStats.answered / sub.questionCount) * 100) || 0;

            return (
              <motion.div
                className="card subject-card subject-card-glow"
                key={sub.id}
                id={`featured-subject-${sub.id}`}
                variants={fadeInUp}
              >
                <div className="subject-header">
                  <div className="subject-icon-box" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
                    <BookOpen size={24} />
                  </div>
                  <span className={`subject-badge ${sub.difficulty.toLowerCase()}`}>{sub.difficulty}</span>
                </div>
                <h3>{sub.name}</h3>
                <p>{sub.description}</p>

                <div className="subject-meta">
                  <span>{sub.questionCount} Questions</span>
                  <span>{percentSolved}% Completed</span>
                </div>

                <div className="subject-progress-container">
                  <div className="subject-progress-bar">
                    <div className="subject-progress-fill" style={{ width: `${percentSolved}%` }}></div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => startSubject(sub.name)}
                  aria-label={`Start practising ${sub.name}`}
                  id={`start-subject-${sub.id}-btn`}
                >
                  Practice Now
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Feature highlight Cards */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="section-header-centered">
          <h2 className="section-title">
            <Shield size={22} style={{ color: 'var(--ethio-green)' }} /> Key Portal Features
          </h2>
          <p className="section-desc">Engineered for full national exam preparedness</p>
        </div>

        <div className="features-grid">
          <div className="card feature-card-interactive" id="feat-by-subject">
            <div className="feature-icon-wrapper flex-primary">
              <BookOpen size={20} />
            </div>
            <h3>Structured Revision</h3>
            <p>Revise mathematics, natural science, and social sciences with clean checkpoints and structured layout chapters.</p>
          </div>

          <div className="card feature-card-interactive" id="feat-quiz-mode">
            <div className="feature-icon-wrapper flex-warning">
              <Award size={20} />
            </div>
            <h3>Realistic Mock Exams</h3>
            <p>Simulate exam conditions with precise timing constraints, high stakes, and realistic questions aligning with the Ministry of Education.</p>
          </div>

          <div className="card feature-card-interactive" id="feat-instant-answers">
            <div className="feature-icon-wrapper flex-accent">
              <Brain size={20} />
            </div>
            <h3>Detailed Explanations</h3>
            <p>Understand your mistakes instantly with detailed, step-by-step solutions that teach you the core principles behind every question.</p>
          </div>

          <div className="card feature-card-interactive" id="feat-progress-track">
            <div className="feature-icon-wrapper flex-danger">
              <Target size={20} />
            </div>
            <h3>Progress Tracking</h3>
            <p>Watch your study stats grow, gain levels, view active streaks, and stay motivated as you approach the real matric date.</p>
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us & Benefits */}
      <motion.section
        className="homepage-section section-why-choose"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="why-choose-wrapper">
          <div className="why-choose-text">
            <h2 className="section-title">Why Choose Our Portal?</h2>
            <p className="section-sub-heading">Tailored strictly for Grade 12 Ethiopian National Curriculum</p>
            <ul className="why-choose-list">
              <li>
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <strong>Official Syllabus Aligned:</strong>
                  <p>Our syllabus is synced with current Ministry of Education directives and textbook updates.</p>
                </div>
              </li>
              <li>
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <strong>In-Depth Diagnostics:</strong>
                  <p>Identify your weak areas immediately and get suggested questions to practice.</p>
                </div>
              </li>
              <li>
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <strong>Designed for Mobile & Desktop:</strong>
                  <p>Read explanations, answer quizzes, and study anywhere, on any device, with no cut-offs.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="why-choose-banner-card card">
            <h4>Ready to Score High?</h4>
            <p>Students who practice on our portal score on average 25% higher on their national matric evaluations.</p>
            <div className="performance-chart-box">
              <div className="chart-bar-label">Without Portal</div>
              <div className="chart-bg">
                <div className="chart-fill fill-low">58%</div>
              </div>
              <div className="chart-bar-label" style={{ marginTop: '0.8rem' }}>With Ethiopian Matric Prep</div>
              <div className="chart-bg">
                <div className="chart-fill fill-high">92%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How it Works / Learning Journey */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="section-header-centered">
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">Your 4-step path to achieving matric success</p>
        </div>

        <div className="journey-steps-grid">
          <div className="journey-step-card">
            <div className="step-number">1</div>
            <h4>Select a Subject</h4>
            <p>Pick from standard school subjects (Mathematics, Chemistry, Physics, History, Civics, etc.).</p>
          </div>
          <div className="journey-step-card">
            <div className="step-number">2</div>
            <h4>Practice with Explanations</h4>
            <p>Solve graded multiple choice questions and read immediate explanations for correct/incorrect answers.</p>
          </div>
          <div className="journey-step-card">
            <div className="step-number">3</div>
            <h4>Simulate Mock Exams</h4>
            <p>Face timed curriculum-focused mock examinations to prepare your speed and control test-taking anxiety.</p>
          </div>
          <div className="journey-step-card">
            <div className="step-number">4</div>
            <h4>Track and Succeed</h4>
            <p>Monitor your progress percentage and level stats. Enter the MoE matric center with total confidence.</p>
          </div>
        </div>
      </motion.section>

      {/* Exam Success Tips Section */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="tips-glow-card card">
          <div className="tips-content">
            <div className="tips-icon">
              <Brain size={32} className="text-yellow-400" />
            </div>
            <div>
              <h3>Quick National Exam Success Tips</h3>
              <div className="tips-list-grid">
                <div className="tip-item">
                  <h5>🔄 Distributive Practice</h5>
                  <p>Study 30 minutes daily per subject rather than cramming 5 hours before the exam day.</p>
                </div>
                <div className="tip-item">
                  <h5>📝 Review Incorrect Answers</h5>
                  <p>Always re-read the feedback explainer inside incorrect response boxes to debug your thinking.</p>
                </div>
                <div className="tip-item">
                  <h5>⏱️ Manage Your Time</h5>
                  <p>Practice mock exams inside our portal to pace yourself to under 1.5 minutes per question.</p>
                </div>
                <div className="tip-item">
                  <h5>🥗 Stay Healthy</h5>
                  <p>Ensure good rest and hydration details in the final 48 hours before entering the testing hall.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Student Testimonials */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="section-header-centered">
          <h2 className="section-title">Student Success Stories</h2>
          <p className="section-desc">Approved and built by Grade 12 students who successfully cracked their matric</p>
        </div>

        <div className="testimonials-grid">
          <div className="card testimonial-card">
            <div className="stars-row">
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
            </div>
            <p className="testimonial-quote">
              "This preparation portal changed my score completely. The mathematics tutorials and mock exams were exactly like the real national matric! I scored 585/600."
            </p>
            <div className="author-row">
              <div className="author-avatar font-accent">KA</div>
              <div>
                <h5>Kidus Assefa</h5>
                <p>Addis Ababa (Bole High School)</p>
              </div>
            </div>
          </div>

          <div className="card testimonial-card">
            <div className="stars-row">
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
            </div>
            <p className="testimonial-quote">
              "I love the detailed explanation feature. It didn't just tell me my answer was wrong; it taught me why. Highly recommend this to all Grade 12 candidates."
            </p>
            <div className="author-row">
              <div className="author-avatar font-primary">MT</div>
              <div>
                <h5>Marta Tadesse</h5>
                <p>Hawassa University School</p>
              </div>
            </div>
          </div>

          <div className="card testimonial-card">
            <div className="stars-row">
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
              <Star size={16} fill="var(--ethio-yellow)" color="var(--ethio-yellow)" />
            </div>
            <p className="testimonial-quote">
              "Being able to set my planner study tasks and count points kept me preparing daily. I passed my Natural Science matric with great colors!"
            </p>
            <div className="author-row">
              <div className="author-avatar font-secondary">YF</div>
              <div>
                <h5>Yared Fikru</h5>
                <p>Adama (St. Joseph School)</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Frequently Asked Questions */}
      <motion.section
        className="homepage-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="section-header-centered">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Got questions? We have answers.</p>
        </div>

        <div className="faq-container-box">
          <FAQItem
            question="Is this aligned with the new Ethiopian Grade 12 curriculum?"
            answer="Yes! All of our questions, exams, and detailed answers are designed strictly based on the current textbooks and curriculum requirements authorized by the Ethiopian Ministry of Education."
          />
          <FAQItem
            question="Can I practice without an internet connection?"
            answer="The application saves your progress, bookmarks, and notes directly to your local browser storage. An active connection is only required to load new questions and authenticate your account."
          />
          <FAQItem
            question="How do the Mock Exams work?"
            answer="Our mock exams contain timed blocks that replicate the actual exam configurations. Once you start, you complete the questions under a countdown. You receive your score, XP indicators, and a detailed diagnostic analysis immediately after finishing."
          />
          <FAQItem
            question="Do I need to pay for a premium subscription?"
            answer="We offer a set of free practice questions and mock tests for every subject. To unlock the full library of advanced national exams and comprehensive diagnostic analytics, you can subscribe to our premium plan."
          />
        </div>
      </motion.section>

      {/* Call To Action Section */}
      <motion.section
        className="homepage-section section-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="cta-card card">
          <div className="cta-overlay-glow"></div>
          <h3>Take the First Step Toward Your Matric Success Today</h3>
          <p>Join over 50,000 Grade 12 students revising with smart mock exams, immediate answers, and level progression trackers.</p>
          <div className="cta-actions">
            <button
              className="btn btn-warning btn-glow"
              onClick={() => setActivePage('signup')}
              aria-label="Sign up for free account"
              id="cta-signup-btn"
            >
              Sign Up Now (Free)
            </button>
            <button
              className="btn btn-secondary text-white border-white bg-transparent"
              onClick={() => setActivePage('subjects')}
              aria-label="Browse all curriculum subjects"
              id="cta-browse-btn"
            >
              Browse Curriculums
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

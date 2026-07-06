import React from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS, QUESTIONS } from '../data/questions';
import { BookOpen, Target, Shield, Award, Sparkles, Zap, Flame, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { progress, setActivePage, setSelectedSubject } = useApp();

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

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" id="hero-banner">
        <div>
          <h1 className="hero-title">
            Prepare with confidence for Ethiopia's <br />
            <span>Grade 12 National Matric</span> Examination
          </h1>
          <p className="hero-subtitle">
            Practice with structured revision, detailed explanations, mock exams, and progress tracking designed for the Ethiopian curriculum and the demands of national examination preparation.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setActivePage('subjects')}>
              Start Your Learning Journey <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary" onClick={startPracticing}>
              Practice with Purpose
            </button>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="mascot-container">
            <span className="mascot-emoji">🎓</span>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-header">
        <h2 className="section-title">
          <Zap size={22} style={{ color: 'var(--ethio-yellow)' }} /> Your Progress At A Glance
        </h2>
      </section>
      
      <div className="stats-container">
        <div className="card stats-card" id="stat-subjects">
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
            <BookOpen size={24} />
          </div>
          <div className="stats-info">
            <h3>{totalSubjects}</h3>
            <p>Total Subjects</p>
          </div>
        </div>

        <div className="card stats-card" id="stat-questions">
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: '#b45309' }}>
            <Target size={24} />
          </div>
          <div className="stats-info">
            <h3>{totalQuestions}</h3>
            <p>Available Questions</p>
          </div>
        </div>

        <div className="card stats-card" id="stat-completed">
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
            <Award size={24} />
          </div>
          <div className="stats-info">
            <h3>{completedQuestions}</h3>
            <p>Completed Questions</p>
          </div>
        </div>

        <div className="card stats-card" id="stat-percent">
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--ethio-red)' }}>
            <Flame size={24} />
          </div>
          <div className="stats-info">
            <h3>{progressPercent}%</h3>
            <p>Syllabus Mastered</p>
          </div>
        </div>
      </div>

      {/* Subjects Quick Access */}
      <section className="section-header">
        <h2 className="section-title">
          <Sparkles size={22} style={{ color: 'var(--ethio-green)' }} /> Popular Subjects
        </h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('subjects')}>
          Explore All Subjects
        </button>
      </section>

      <div className="subjects-grid">
        {SUBJECTS.slice(0, 3).map((sub) => {
          const solvedStats = progress.subjectProgress[sub.name] || { answered: 0, correct: 0 };
          const percentSolved = Math.round((solvedStats.answered / sub.questionCount) * 100) || 0;
          
          return (
            <div className="card subject-card" key={sub.id} id={`featured-subject-${sub.id}`}>
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

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => startSubject(sub.name)}>
                Practice Now
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Highlight Cards */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">
            <Shield size={22} style={{ color: 'var(--ethio-green)' }} /> Platform Features
          </h2>
        </div>
        <div className="features-grid">
          <div className="card feature-card" id="feat-by-subject">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
              <BookOpen size={20} />
            </div>
            <h3>Study by Subject</h3>
            <p>Focus on core areas such as mathematics, physics, and Ethiopian history with organized revision paths.</p>
          </div>

          <div className="card feature-card" id="feat-instant-answers">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: '#b45309' }}>
              <Target size={20} />
            </div>
            <h3>Clear Explanations</h3>
            <p>Understand each answer with concise, step-by-step guidance that strengthens your confidence and study habits.</p>
          </div>

          <div className="card feature-card" id="feat-quiz-mode">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--ethio-red)' }}>
              <Award size={20} />
            </div>
            <h3>Realistic Mock Exams</h3>
            <p>Practice under timed conditions with full-length mock exams that mirror the pressure of the real matric experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

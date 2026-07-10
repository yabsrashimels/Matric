import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { isPremiumQuestion } from '../data/questions';
import { loadQuestionPool } from '../lib/questionPool';
import { Question } from '../types';
import { Timer, AlertTriangle, CheckCircle, RefreshCw, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';

interface MockAnswer {
  questionId: number;
  selectedOption: string | null;
  correctAnswer: string;
}

export const MockExamPage: React.FC = () => {
  const { addXP, playCorrectSound, playIncorrectSound, triggerConfetti, isLocked, registerQuestions } = useApp();

  const [examPool, setExamPool] = useState<Question[]>([]);

  const [examActive, setExamActive] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<Question[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [finalScore, setFinalScore] = useState(0); // number of correct answers
  const [reviewMode, setReviewMode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadQuestionPool(!isLocked(2)).then((pool) => {
      setExamPool(pool);
      registerQuestions(pool);
    });
  }, [isLocked, registerQuestions]);

  // Generate random questions for Mock Exam
  const startExam = () => {
    let pool = examPool;
    if (isLocked(2)) {
      pool = examPool.filter(q => !isPremiumQuestion(q));
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    setMockQuestions(selected);
    setCurrentExamIndex(0);
    setAnswers({});
    setTimeLeft(600);
    setExamActive(true);
    setExamSubmitted(false);
    setReviewMode(false);
  };

  // Timer countdown hook
  useEffect(() => {
    if (examActive && !examSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitExam(true); // force auto-submit on time-up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examActive, examSubmitted, answers, mockQuestions]);

  const handleOptionSelect = (option: string) => {
    if (examSubmitted) return;
    const currentQ = mockQuestions[currentExamIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option
    }));
  };

  const handleSubmitExam = (force = false) => {
    if (!force && !window.confirm('Are you sure you want to submit your exam? Any unanswered questions will be marked incorrect.')) {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    mockQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    setFinalScore(correctCount);
    setExamSubmitted(true);

    // Gamification reward: 15 XP for completing, and 15 extra XP per correct answer!
    const bonusXp = 15 + (correctCount * 15);
    addXP(bonusXp);

    if (correctCount >= 6) {
      playCorrectSound();
      triggerConfetti();
    } else {
      playIncorrectSound();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = mockQuestions[currentExamIndex];

  // Group performance results by subject
  const getPerformanceBySubject = () => {
    const subjectsMap: { [sub: string]: { total: number; correct: number } } = {};

    mockQuestions.forEach((q) => {
      if (!subjectsMap[q.subject]) {
        subjectsMap[q.subject] = { total: 0, correct: 0 };
      }
      subjectsMap[q.subject].total += 1;
      if (answers[q.id] === q.correctAnswer) {
        subjectsMap[q.subject].correct += 1;
      }
    });

    return Object.entries(subjectsMap).map(([subject, stats]) => ({
      subject,
      ...stats,
      ratio: Math.round((stats.correct / stats.total) * 100)
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Ethiopian Grade 12 Mock Examination</h1>
        <p className="subtitle-main">
          Experience real-time exam pacing. Complete a balanced mix of 10 curriculum questions with a strictly enforced countdown timer.
        </p>
      </div>

      {!examActive && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <Trophy size={60} style={{ color: 'var(--ethio-yellow)', marginBottom: '1.5rem' }} />
          <h2>National Exam Simulation</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0.5rem auto 2rem' }}>
            This mock exam simulates real Grade 12 national exam conditions. You will have <strong>10 minutes (600 seconds)</strong> to answer <strong>10 comprehensive questions</strong> across multiple subjects.
          </p>

          <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem 1.5rem', margin: '0 auto 2rem', maxWidth: '400px', textAlign: 'left', fontSize: '0.85rem' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Exam Regulations:</h4>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>Timer cannot be paused once started.</li>
              <li>Auto-submission triggers instantly when timer reaches 0:00.</li>
              <li>Each correct answer yields big XP and custom badges.</li>
              <li>Get immediate performance breakdown by subject after submission.</li>
            </ul>
          </div>

          <button className="btn btn-primary" onClick={startExam} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            Start Mock Exam
          </button>
        </div>
      )}

      {examActive && !examSubmitted && (
        <div className="mock-exam-grid">
          {/* Main Question Panel */}
          <div>
            <div className="question-nav-header">
              <span style={{ fontWeight: '600' }}>
                Question {currentExamIndex + 1} of 10
              </span>
              <div className="question-stats-meta">
                <span className="meta-pill">{currentQ.subject}</span>
                <span className="meta-pill">{currentQ.topic}</span>
              </div>
            </div>

            <div className="card question-card">
              <div className="question-text" style={{ fontSize: '1.2rem' }}>
                {currentQ.question}
              </div>

              <div className="options-list">
                {currentQ.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = answers[currentQ.id] === option;
                  return (
                    <button
                      key={idx}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <span className="option-letter">{letter}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              <div className="question-actions" style={{ marginTop: '2rem' }}>
                <div className="action-left">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentExamIndex(prev => prev - 1)}
                    disabled={currentExamIndex === 0}
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentExamIndex(prev => prev + 1)}
                    disabled={currentExamIndex === 9}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>

                <div className="action-right">
                  <button className="btn btn-accent" onClick={() => handleSubmitExam(false)}>
                    Submit Exam
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Timer & Grid Panel */}
          <div>
            <div className="card mock-timer-panel" style={{ position: 'sticky', top: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <Timer size={18} /> COUNTDOWN TIMER
              </div>
              <div className={`timer-digits ${timeLeft <= 60 ? 'warning' : ''}`}>
                {formatTime(timeLeft)}
              </div>

              <h4 style={{ fontWeight: '600', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem', textAlign: 'left' }}>
                Questions Navigator
              </h4>
              <div className="mock-grid-nav">
                {mockQuestions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = idx === currentExamIndex;

                  let btnClass = 'mock-grid-btn';
                  if (isAnswered) btnClass += ' answered';
                  if (isCurrent) btnClass += ' current';

                  return (
                    <button
                      key={q.id}
                      className={btnClass}
                      onClick={() => setCurrentExamIndex(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1.25rem', textAlign: 'left', lineHeight: '1.4' }}>
                💡 Green tiles represent answered questions. You can revisit any tile to review or modify your selected choices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exam Post-Submission Results & Analysis */}
      {examActive && examSubmitted && !reviewMode && (
        <div className="card mock-results-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <Trophy size={54} style={{ color: 'var(--ethio-yellow)', marginBottom: '0.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Exam Submitted successfully!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Awesome effort! Let's check your scores and topic performance across the Ethiopian curriculum.
            </p>

            <div className={`score-display-radial ${finalScore >= 6 ? 'pass' : 'fail'}`}>
              <span className="score-num">{finalScore * 10}%</span>
              <span className="score-label">{finalScore} / 10 Correct</span>
            </div>

            <h3 style={{ color: finalScore >= 6 ? 'var(--ethio-green)' : 'var(--ethio-red)', fontWeight: '700', fontSize: '1.3rem' }}>
              {finalScore >= 8 ? '🎉 Outstanding Result! (Mock Champion)' : finalScore >= 6 ? '👏 Passed! Good Foundation' : '✍️ Needs Improvement'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              You've earned <strong>+{15 + (finalScore * 15)} XP</strong> for completes and correct answers!
            </p>
          </div>

          {/* Subject Breakdown Analysis */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>Subject Performance Analysis</h4>
            <div className="analysis-grid">
              {getPerformanceBySubject().map((item, idx) => (
                <div key={idx} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `4px solid ${item.ratio >= 60 ? 'var(--ethio-green)' : 'var(--ethio-red)'}` }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.subject}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Score: {item.ratio}%</span>
                    <span>{item.correct} / {item.total} Correct</span>
                  </div>
                  <div className="subject-progress-bar">
                    <div className="subject-progress-fill" style={{ width: `${item.ratio}%`, backgroundColor: item.ratio >= 60 ? 'var(--ethio-green)' : 'var(--ethio-red)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: item.ratio >= 60 ? 'var(--ethio-green)' : 'var(--ethio-red)', textTransform: 'uppercase' }}>
                    {item.ratio >= 60 ? '✓ Strong Subject' : '⚠️ Weak Subject'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setReviewMode(true)}>
              Review Detailed Answers
            </button>
            <button className="btn btn-primary" onClick={startExam}>
              Retake Mock Exam <RefreshCw size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setExamActive(false)}>
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Review Mode Panel */}
      {examActive && examSubmitted && reviewMode && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '600' }}>Reviewing Exam Answers</h3>
            <button className="btn btn-secondary" onClick={() => setReviewMode(false)}>
              Back to Results Analysis
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mockQuestions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={q.id} className="card" style={{ borderLeft: `5px solid ${isCorrect ? 'var(--ethio-green)' : 'var(--ethio-red)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <span>Question {idx + 1} ({q.subject})</span>
                    <span style={{ color: isCorrect ? 'var(--ethio-green)' : 'var(--ethio-red)', fontWeight: '600' }}>
                      {isCorrect ? '✓ Correct' : userAnswer ? '❌ Incorrect' : '⚠️ Unanswered'}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1rem' }}>{q.question}</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      let optionStyle: React.CSSProperties = { padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' };

                      if (opt === q.correctAnswer) {
                        optionStyle.backgroundColor = 'rgba(7, 137, 48, 0.1)';
                        optionStyle.borderColor = 'var(--ethio-green)';
                        optionStyle.color = 'var(--ethio-green)';
                        optionStyle.fontWeight = '600';
                      } else if (opt === userAnswer) {
                        optionStyle.backgroundColor = 'rgba(218, 18, 26, 0.1)';
                        optionStyle.borderColor = 'var(--ethio-red)';
                        optionStyle.color = 'var(--ethio-red)';
                      }

                      return (
                        <div key={oIdx} style={optionStyle}>
                          <strong>{letter}.</strong> {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>Explanation:</strong> {q.explanation}
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.75rem' }}>
                      Reference: {q.reference}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={startExam}>
              Retake Mock Exam <RefreshCw size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setExamActive(false)}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

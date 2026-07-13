import React, { useEffect, useState } from 'react';
import { Question } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Lightbulb,
  CheckCircle, AlertTriangle
} from 'lucide-react';

export interface QuestionViewerProps {
  questions: Question[];
  title: string;
  subtitle?: string;
  isPreview?: boolean;
  loading?: boolean;
  onBack?: () => void;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  questions,
  title,
  subtitle,
  isPreview = false,
  loading = false,
  onBack,
}) => {
  const {
    progress,
    answerQuestion,
    toggleFavorite,
    playCorrectSound,
    playIncorrectSound,
    triggerConfetti,
    registerQuestions,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setShowHint(false);
  }, [questions]);

  useEffect(() => {
    if (questions.length > 0) {
      registerQuestions(questions);
    }
  // registerQuestions is stable (useCallback), questions reference changes only when content changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setShowHint(false);
  }, [currentQuestion?.id]);

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion || isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!currentQuestion || !selectedOption || isAnswered) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);
    setShowExplanation(true);
    answerQuestion(currentQuestion.id, isCorrect);
    if (isCorrect) {
      playCorrectSound();
      triggerConfetti();
    } else {
      playIncorrectSound();
    }
  };

  if (loading) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading questions...</div>;
  }

  if (!questions.length) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Questions not found.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          {onBack && (
            <button className="btn btn-secondary" style={{ marginBottom: '0.75rem' }} onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <h1 className="title-main">{title}</h1>
          {subtitle && <p className="subtitle-main">{subtitle}</p>}
          {isPreview && (
            <p style={{ color: 'var(--ethio-yellow)', fontSize: '0.9rem' }}>
              Free preview — upgrade to unlock all questions in this exam year.
            </p>
          )}
        </div>
        <span className="subject-badge medium">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {currentQuestion && (
        <div className="card practice-question-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span className="subject-badge easy">{currentQuestion.difficulty}</span>
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                {currentQuestion.topic} • {currentQuestion.year}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={() => toggleFavorite(currentQuestion.id)}>
              {progress.favorites.includes(currentQuestion.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>{currentQuestion.question}</p>

          <div className="options-grid">
            {currentQuestion.options.map((option, index) => {
              const letter = ['A', 'B', 'C', 'D'][index];
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              let className = 'option-btn';
              if (isAnswered) {
                if (isCorrect) className += ' correct';
                else if (isSelected) className += ' incorrect';
              } else if (isSelected) {
                className += ' selected';
              }

              return (
                <button key={letter} className={className} onClick={() => handleOptionSelect(option)} disabled={isAnswered}>
                  <strong>{letter}.</strong> {option}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {!isAnswered ? (
              <button className="btn btn-primary" disabled={!selectedOption} onClick={handleSubmit}>
                Submit Answer
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => setShowExplanation((v) => !v)}>
                  {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowHint((v) => !v)}>
                  <Lightbulb size={16} /> Hint
                </button>
              </>
            )}
          </div>

          {showHint && currentQuestion.hint && (
            <div className="card" style={{ marginTop: '1rem', background: 'var(--warning-light)' }}>
              <strong>Hint:</strong> {currentQuestion.hint}
            </div>
          )}

          {showExplanation && (
            <div className="card" style={{ marginTop: '1rem', background: 'var(--accent-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {selectedOption === currentQuestion.correctAnswer ? (
                  <CheckCircle size={18} style={{ color: 'var(--ethio-green)' }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: 'var(--ethio-red)' }} />
                )}
                <strong>Explanation</strong>
              </div>
              <p>{currentQuestion.explanation || 'No explanation provided.'}</p>
              {currentQuestion.reference && <p style={{ fontSize: '0.85rem' }}>Reference: {currentQuestion.reference}</p>}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
          <ArrowLeft size={16} /> Previous
        </button>
        <button
          className="btn btn-primary"
          disabled={currentIndex >= questions.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
        >
          Next <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

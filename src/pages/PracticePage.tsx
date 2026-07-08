import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { isPremiumQuestion, QUESTIONS, SUBJECTS } from '../data/questions';
import { api } from '../lib/api';
import { Question } from '../types';
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Lightbulb,
  BookOpen, Search, Filter, RefreshCw, CheckCircle, AlertTriangle,
  Clock, Share2, Maximize2, Minimize2
} from 'lucide-react';

export const PracticePage: React.FC = () => {
  const {
    progress, answerQuestion, toggleFavorite, saveNote,
    playCorrectSound, playIncorrectSound, triggerConfetti,
    selectedSubject, setSelectedSubject, isLocked, membershipPlan
  } = useApp();

  const [questionPool, setQuestionPool] = useState<Question[]>(QUESTIONS);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(SUBJECTS.map((subject) => subject.name));
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState(selectedSubject || 'All');

  // Interactive modes
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Practice navigation state
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Sync subject filter if selectedSubject from context changes
  useEffect(() => {
    if (selectedSubject) {
      setSubjectFilter(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const response = await api.getQuestions({ limit: 200 });
        const rows = Array.isArray(response?.data?.questions) ? response.data.questions : [];

        if (rows.length > 0) {
          const mappedQuestions = rows.map((row: any) => {
            const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter((value: string | null | undefined) => Boolean(value));
            const correctLetter = String(row.correct_answer || '').toUpperCase();
            const answerIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
            const correctAnswer = answerIndex >= 0 && answerIndex < options.length ? options[answerIndex] : (options[0] || '');

            return {
              id: Number(row.id),
              subject: row.subject_name || row.subject || 'General',
              topic: row.topic_name || row.topic || 'General',
              difficulty: (row.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
              year: Number(row.year || new Date().getFullYear()),
              question: row.question || 'No question text available',
              options,
              correctAnswer,
              explanation: row.explanation || '',
              incorrectExplanations: {},
              reference: row.reference || '',
              hint: row.hint || '',
              time: row.estimated_time ? `${row.estimated_time} seconds` : '60 seconds',
            } as Question;
          });

          // Combine with bundled static QUESTIONS (e.g. 2014 Math JSON)
          const dbTexts = new Set(mappedQuestions.map(q => q.question));
          const uniqueStatic = QUESTIONS.filter(q => !dbTexts.has(q.question)).map(q => ({
            ...q,
            id: q.id + 100000 // Offset ID to avoid collision with DB primary keys
          }));

          const combinedQuestions = [...mappedQuestions, ...uniqueStatic];

          setQuestionPool(combinedQuestions);
          setSubjectOptions(Array.from(new Set(combinedQuestions.map((question) => question.subject))) as string[]);
          setIsLoadingQuestions(false);
          return;
        }
      } catch (error) {
        console.warn('Unable to load live question bank, using the bundled practice bank.', error);
      }

      setQuestionPool(QUESTIONS);
      setSubjectOptions(SUBJECTS.map((subject) => subject.name));
      setIsLoadingQuestions(false);
    };

    loadQuestions();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = questionPool;

    // Filter out locked Premium questions (Math & Physics 2014/2015/2016 — requires 100 ETB)
    if (isLocked(2)) {
      result = result.filter(q => !isPremiumQuestion(q));
    }

    // Subject
    if (subjectFilter !== 'All') {
      result = result.filter(q => q.subject.toLowerCase() === subjectFilter.toLowerCase());
    }

    // Difficulty
    if (difficultyFilter !== 'All') {
      result = result.filter(q => q.difficulty === difficultyFilter);
    }

    // Year
    if (yearFilter !== 'All') {
      result = result.filter(q => q.year === parseInt(yearFilter));
    }

    // Status
    if (statusFilter !== 'All') {
      if (statusFilter === 'Answered') {
        result = result.filter(q => progress.completedQuestionIds.includes(q.id));
      } else if (statusFilter === 'Unanswered') {
        result = result.filter(q => !progress.completedQuestionIds.includes(q.id));
      }
    }

    // Search query (matches topic, question text, or explanations)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(q =>
        q.question.toLowerCase().includes(query) ||
        q.topic.toLowerCase().includes(query) ||
        q.subject.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(result);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
  }, [questionPool, subjectFilter, difficultyFilter, yearFilter, statusFilter, searchQuery, progress.completedQuestionIds, membershipPlan]);

  // Load saved note for the current question
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      const activeQ = filteredQuestions[currentIndex];
      setNoteText(progress.notes[activeQ.id] || '');
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  }, [currentIndex, filteredQuestions, progress.notes]);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!currentQuestion || !selectedOption || isAnswered) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);

    // Call context actions
    answerQuestion(currentQuestion.id, isCorrect);

    if (isCorrect) {
      playCorrectSound();
      triggerConfetti();
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSaveNote = () => {
    if (currentQuestion) {
      saveNote(currentQuestion.id, noteText);
      alert('Note saved successfully for this question!');
    }
  };

  const handleShare = () => {
    if (currentQuestion) {
      const shareText = `Check out this Grade 12 Matric Question: "${currentQuestion.question}" on Ethio Matric Prep!`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        alert('Question text and share info copied to clipboard!');
      } else {
        alert(shareText);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('All');
    setYearFilter('All');
    setStatusFilter('All');
    setSubjectFilter('All');
    setSelectedSubject(null);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return; // Don't trigger when typing in fields
      }

      switch (e.key.toLowerCase()) {
        case 'a': handleOptionSelect(currentQuestion?.options[0]); break;
        case 'b': handleOptionSelect(currentQuestion?.options[1]); break;
        case 'c': handleOptionSelect(currentQuestion?.options[2]); break;
        case 'd': handleOptionSelect(currentQuestion?.options[3]); break;
        case 'enter': if (selectedOption && !isAnswered) handleSubmit(); break;
        case 'arrowright': if (isAnswered) handleNext(); break;
        case 'arrowleft': handlePrev(); break;
        case 'f': if (currentQuestion) toggleFavorite(currentQuestion.id); break;
        case 'h': setShowHint(prev => !prev); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, selectedOption, isAnswered]);

  return (
    <div className={isFullscreen ? 'fullscreen-mode-container' : ''} style={isFullscreen ? { backgroundColor: 'var(--bg-primary)', padding: '2rem', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, overflowY: 'auto' } : {}}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="title-main">
            {subjectFilter !== 'All' ? `${subjectFilter} Practice` : 'Universal Practice Pool'}
          </h1>
          <p className="subtitle-main" style={{ marginBottom: 0 }}>
            Solve matric questions, get step-by-step notes, and master specific topics. Use keyboard shortcuts <strong>[A, B, C, D]</strong> to choose options and <strong>[Enter]</strong> to submit.
            {isLoadingQuestions && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading the latest live question bank…</span>}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Toggle Fullscreen Focus"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />} {isFullscreen ? 'Exit Focus' : 'Focus Mode'}
        </button>
      </div>

      {/* Filter panel */}
      <div className="filter-panel">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search questions by topic, keyword, or formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {(searchQuery || difficultyFilter !== 'All' || yearFilter !== 'All' || statusFilter !== 'All' || subjectFilter !== 'All') && (
            <button className="btn btn-secondary" onClick={handleResetFilters} style={{ flexShrink: 0 }}>
              <RefreshCw size={16} /> Clear Filters
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Subject</label>
            <select className="filter-select" value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setSelectedSubject(e.target.value === 'All' ? null : e.target.value); }}>
              <option value="All">All Subjects</option>
              {subjectOptions.map((subjectName) => <option key={subjectName} value={subjectName}>{subjectName}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <select className="filter-select" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Matric Year</label>
            <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="All">All Years</option>
              <option value="2016">2016 Exam</option>
              <option value="2015">2015 Exam</option>
              <option value="2014">2014 Exam</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Progress Status</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Answered">Answered</option>
              <option value="Unanswered">Unanswered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main interactive layout */}
      {filteredQuestions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertTriangle size={48} style={{ color: 'var(--ethio-red)', marginBottom: '1rem' }} />
          <h3>No Questions Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            We couldn't find any questions matching your active filters or search terms. Try broadening your criteria!
          </p>
          <button className="btn btn-primary" onClick={handleResetFilters}>
            Reset Search Filters
          </button>
        </div>
      ) : (
        <div className="practice-layout">
          {/* Left Panel: The Active Question */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Nav and Tracker bar */}
            <div className="question-nav-header">
              <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Question {currentIndex + 1} of {filteredQuestions.length}
              </span>
              <div className="question-stats-meta">
                <span className="meta-pill">{currentQuestion.year} Metric</span>
                <span className="meta-pill">{currentQuestion.topic}</span>
                <span className={`meta-pill difficulty ${currentQuestion.difficulty}`}>
                  {currentQuestion.difficulty}
                </span>
                {progress.completedQuestionIds.includes(currentQuestion.id) && (
                  <span className="meta-pill" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
                    ✓ Solved
                  </span>
                )}
              </div>
            </div>

            {/* Core Question Card */}
            <div className="card question-card" id={`active-question-card-${currentQuestion.id}`}>
              <div className="question-text" id="practice-question-text">
                {currentQuestion.question}
              </div>

              {/* Options buttons */}
              <div className="options-list">
                {currentQuestion.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQuestion.correctAnswer;

                  // Visual button class mapping
                  let btnClass = 'option-btn';
                  if (isSelected) btnClass += ' selected';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnClass += ' correct';
                    } else if (isSelected) {
                      btnClass += ' incorrect-selected';
                    }
                  }

                  return (
                    <div key={idx}>
                      <button
                        className={btnClass}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isAnswered}
                        id={`option-${letter}`}
                      >
                        <span className="option-letter">{letter}</span>
                        <span style={{ flexGrow: 1 }}>{option}</span>
                      </button>

                      {/* Explanations of individual incorrect options once answered */}
                      {isAnswered && isSelected && !isCorrect && (
                        <span className="option-explain-text">
                          ⚠️ {currentQuestion.incorrectExplanations[option] || "This choice is incorrect."}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom control actions */}
              <div className="question-actions">
                <div className="action-left">
                  <button
                    className="btn btn-secondary"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft size={16} /> Prev
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleNext}
                    disabled={currentIndex === filteredQuestions.length - 1}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>

                <div className="action-right">
                  <button
                    className="btn btn-secondary"
                    onClick={() => toggleFavorite(currentQuestion.id)}
                    title="Bookmark Question"
                  >
                    {progress.favorites.includes(currentQuestion.id) ? (
                      <BookmarkCheck size={18} style={{ color: 'var(--ethio-green)' }} />
                    ) : (
                      <Bookmark size={18} />
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleShare}
                    title="Share Question"
                  >
                    <Share2 size={18} />
                  </button>

                  {!isAnswered ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      id="submit-answer-btn"
                    >
                      Check Answer [Enter]
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-warning"
                      onClick={handleNext}
                      disabled={currentIndex === filteredQuestions.length - 1}
                    >
                      Next Question <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step-by-Step Explanation section (renders upon answer checking) */}
            {isAnswered && (
              <div className={`card explanation-card ${selectedOption === currentQuestion.correctAnswer ? '' : 'wrong-border'}`} id="explanation-box">
                <h3 className="explanation-title">
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <span style={{ color: 'var(--ethio-green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={20} /> ✅ Correct Answer
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ethio-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={20} /> ❌ Incorrect choice selected
                    </span>
                  )}
                </h3>

                <div className="explanation-body">
                  <p><strong>Correct Option:</strong> {currentQuestion.correctAnswer}</p>
                  <p style={{ whiteSpace: 'pre-line' }}>{currentQuestion.explanation}</p>

                  <div className="explanation-meta-list">
                    <div className="explanation-meta-item">
                      <strong>Curriculum Unit:</strong> {currentQuestion.reference}
                    </div>
                    <div className="explanation-meta-item">
                      <strong>Estimated Time:</strong> {currentQuestion.time}
                    </div>
                    <div className="explanation-meta-item">
                      <strong>Difficulty:</strong> {currentQuestion.difficulty}
                    </div>
                    <div className="explanation-meta-item">
                      <strong>Topic Category:</strong> {currentQuestion.topic}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Side Aids (Hints, Custom Notes) */}
          <div className="practice-side-panel">
            {/* Quick Hint Card */}
            <div className="side-hint-box" id="hint-box">
              <h4 className="hint-title" onClick={() => setShowHint(!showHint)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lightbulb size={18} /> Reveal Hint
                </span>
                <span style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>{showHint ? 'Hide' : 'Show [H]'}</span>
              </h4>
              {showHint ? (
                <p className="hint-body" id="hint-text">{currentQuestion.hint}</p>
              ) : (
                <p className="hint-body" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
                  Stuck? Click to reveal a helpful curriculum guideline or formula key.
                </p>
              )}
            </div>

            {/* Custom Notes Card */}
            <div className="card">
              <div className="notes-editor">
                <h4 style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} style={{ color: 'var(--ethio-green)' }} /> Study Notes
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Write formulas, reference equations, or personal memory tips here. Notes are stored locally for this question.
                </p>
                <textarea
                  className="notes-textarea"
                  placeholder="E.g., Integration of 3x^2 is x^3. Must remember to apply upper bound subtraction next time..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                ></textarea>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleSaveNote}>
                  Save Notes
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Help Card */}
            <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)' }}>
              <h5 style={{ fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Keyboard Shortcuts
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div><strong>A, B, C, D</strong> - Select options</div>
                <div><strong>Enter</strong> - Check choice</div>
                <div><strong>← / →</strong> - Prev / Next</div>
                <div><strong>F</strong> - Favorite question</div>
                <div><strong>H</strong> - Toggle hint</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

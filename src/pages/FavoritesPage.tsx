import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUESTIONS } from '../data/questions';
import { Bookmark, HelpCircle, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { progress, toggleFavorite } = useApp();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filter questions that are inside the favorites array
  const favoriteQuestions = QUESTIONS.filter(q => progress.favorites.includes(q.id));

  const handleToggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Bookmarked Questions</h1>
        <p className="subtitle-main">
          Review difficult problems, study formulas, or revisit specific exam questions you flagged for active recall later.
        </p>
      </div>

      {favoriteQuestions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bookmark size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
          <h3>No Bookmarked Questions</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '450px', margin: '0.5rem auto 1.5rem' }}>
            When practicing questions in the <strong>Practice Pool</strong>, click the bookmark icon to save difficult questions here for structured revision.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {favoriteQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const solved = progress.completedQuestionIds.includes(q.id);

            return (
              <div key={q.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="meta-pill" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)', fontWeight: '600' }}>
                      {q.subject}
                    </span>
                    <span className="meta-pill">{q.year} Metric</span>
                    <span className="meta-pill">{q.topic}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => handleToggleExpand(q.id)}
                    >
                      {isExpanded ? 'Hide Details' : 'Show Question'}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.6rem', color: 'var(--ethio-red)', border: 'none' }}
                      onClick={() => toggleFavorite(q.id)}
                      title="Remove Bookmark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontWeight: '600', marginTop: '1rem', fontSize: '1.05rem', cursor: 'pointer' }} onClick={() => handleToggleExpand(q.id)}>
                  {q.question}
                </h4>

                {isExpanded && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div 
                            key={oIdx} 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              borderRadius: '8px', 
                              border: isCorrect ? '1px solid var(--ethio-green)' : '1px solid var(--border-color)',
                              backgroundColor: isCorrect ? 'var(--accent-light)' : 'var(--bg-secondary)',
                              color: isCorrect ? 'var(--ethio-green)' : 'inherit',
                              fontSize: '0.85rem',
                              fontWeight: isCorrect ? '600' : 'normal'
                            }}
                          >
                            <strong>{letter}.</strong> {opt} {isCorrect && '✓ (Correct)'}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Step-by-Step Explanation:</strong>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{q.explanation}</p>
                      <span style={{ display: 'block', marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Textbook reference: {q.reference}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

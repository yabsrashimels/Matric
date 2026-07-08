import React, { useState } from 'react';
import { api } from '../lib/api';

const toEthiopianYear = (year: number) => `${year} E.C.`;

export const Premium2014Panel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const fetchPremium = async () => {
    setError(null);
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('ethio_token') : null;
    if (!token) {
      setError('Please sign in first. Use the seeded Premium account: student@matricprep.com / password123');
      setLoading(false);
      return;
    }

    try {
      const res = await api.getPremiumQuestionsByYear(2014);
      const data = Array.isArray(res?.data) ? res.data : [];
      setQuestions(data);

      if (data.length === 0) {
        setError('The premium request succeeded, but no questions were returned for that year.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch premium questions';
      if (msg.includes('402') || msg.includes('Payment required')) {
        setError('Your account is not marked as paid yet. Sign in with the seeded Premium account or complete a 100 ETB payment first.');
      } else if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Access denied')) {
        setError('Please sign in first. The Premium account is student@matricprep.com / password123.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={fetchPremium} disabled={loading}>
          {loading ? 'Loading...' : 'Load 2014 E.C. Premium Math Q&A'}
        </button>
        <small style={{ color: 'var(--text-secondary)' }}>Premium access requires a 100 ETB paid account.</small>
      </div>

      <div style={{ marginTop: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Demo login: <strong>student@matricprep.com</strong> / <strong>password123</strong>
      </div>

      {error && <div className="alert-danger" style={{ marginTop: '0.75rem' }}>{error}</div>}

      {questions.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>{toEthiopianYear(2014)} Mathematics — Premium Q&A ({questions.length})</h4>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.75rem' }}>
            {questions.map((q: any) => {
              const prompt = q.question_text || q.question || q.questionText || 'No question text';
              const options = Array.isArray(q.options)
                ? q.options
                : [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
              const answer = q.correct_answer || q.correctAnswer || q.answer || '—';
              const explanation = q.explanation || '';

              return (
                <div key={q.id} className="card" style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700 }}>{prompt}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{q.topic_name || q.topic || ''}</div>
                  </div>
                  <ul style={{ marginTop: '0.5rem' }}>
                    {options.map((opt: any, idx: number) => (
                      <li key={`${q.id}-${idx}`} style={{ marginBottom: '0.25rem' }}>{opt}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Answer: {answer}</div>
                  {explanation && <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{explanation}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

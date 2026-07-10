import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { SubjectGrid } from '../components/exam/SubjectGrid';

export const SubjectsPage: React.FC = () => {
  const { progress } = useApp();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getSubjects();
        const catalog = Array.isArray(response?.data) ? response.data : [];
        setSubjects(catalog);
      } catch {
        setError('Unable to load subjects.');
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, []);

  const handleSelect = (slug: string) => {
    navigate(`/subjects/${slug}`);
  };

  const gridItems = subjects.map((subject) => {
    const solvedStats = progress.subjectProgress[subject.name] || { answered: 0, correct: 0 };
    const percentSolved = subject.questionCount
      ? Math.round((solvedStats.answered / subject.questionCount) * 100) || 0
      : 0;

    return {
      slug: subject.slug,
      name: subject.name,
      icon: subject.icon,
      description:
        subject.type === 'nested'
          ? 'History, Geography, Economics, and Civics past papers.'
          : `Practice ${subject.name} past exam questions by year.`,
      questionCount: subject.questionCount || 0,
      years: subject.years || [],
      type: subject.type,
      percentSolved,
      accuracy: solvedStats.answered > 0 ? Math.round((solvedStats.correct / solvedStats.answered) * 100) : 0,
      answered: solvedStats.answered,
    };
  });

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Grade 12 National Exam Subjects</h1>
        <p className="subtitle-main">
          Subjects and years are loaded automatically from the data folder. Add a new JSON file and it appears here without code changes.
        </p>
      </div>

      {loading && <div className="card" style={{ padding: '2rem' }}>Loading subjects...</div>}
      {error && <div className="card" style={{ padding: '2rem' }}>{error}</div>}
      {!loading && !error && <SubjectGrid subjects={gridItems} onSelect={handleSelect} />}

      <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--accent-light), var(--warning-light))', border: '1px solid rgba(7, 137, 48, 0.2)' }}>
        <div style={{ fontSize: '2rem' }}>💡</div>
        <div>
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Biology shows 2008–2010 only</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Years are detected from filenames in each subject folder. Social stream subjects use nested navigation: Social → History → 2014.
          </p>
        </div>
      </div>
    </div>
  );
};

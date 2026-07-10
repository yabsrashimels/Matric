import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { YearSelector } from '../components/exam/YearSelector';
import { SocialNavigator } from '../components/exam/SocialNavigator';
import { LockedContent } from '../components/exam/LockedContent';
import { QuestionViewer } from '../components/exam/QuestionViewer';
import { PaymentBanner } from '../components/exam/PaymentBanner';
import { ArrowLeft } from 'lucide-react';
import { Question } from '../types';

function mapApiQuestions(response: any, fallbackYear: string): Question[] {
  return (response.data?.questions || []).map((row: any, index: number) => {
    const options = row.options || [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
    const letterIndex = ['A', 'B', 'C', 'D'].indexOf(String(row.correct_answer || 'A').toUpperCase());
    return {
      id: Number(row.id || index + 1),
      subject: response.data.subject,
      topic: row.topic || 'General',
      difficulty: row.difficulty || 'Medium',
      year: Number(row.year || fallbackYear),
      question: row.question,
      options,
      correctAnswer: row.correctAnswer || options[letterIndex] || options[0],
      explanation: row.explanation || '',
      incorrectExplanations: {},
      reference: row.reference || '',
      hint: row.hint || '',
      time: row.time || '60 seconds',
    };
  });
}

export const SubjectDetailPage: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user, setActivePage } = useApp();
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getCatalogSubject(slug);
        if (!response.success) {
          setError(response.message || 'Subject not found.');
          return;
        }
        setSubject(response.data);
      } catch {
        setError('Unable to load subject details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return <div className="card" style={{ padding: '2rem' }}>Loading subject...</div>;
  }

  if (error || !subject) {
    return <div className="card" style={{ padding: '2rem' }}>{error || 'Subject not found.'}</div>;
  }

  if (subject.type === 'nested' || subject.slug === 'social') {
    return (
      <SocialNavigator
        children={subject.children || []}
        selectedChild={null}
        selectedYear={null}
        onSelectChild={(childSlug) => navigate(`/subjects/social/${childSlug}`)}
        onSelectYear={() => undefined}
        onBack={() => navigate('/subjects')}
      />
    );
  }

  return (
    <div>
      <button className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => navigate('/subjects')}>
        <ArrowLeft size={16} /> Back to Subjects
      </button>
      <h1 className="title-main">{subject.name}</h1>
      <p className="subtitle-main">Choose an exam year to begin practice.</p>

      <YearSelector
        years={subject.years || []}
        selectedYear={null}
        onSelect={(year) => {
          if (!user) {
            setActivePage('login');
            navigate('/login');
            return;
          }
          navigate(`/practice/${subject.slug}/${year}`);
        }}
      />
    </div>
  );
};

export const SocialSubjectPage: React.FC = () => {
  const { subSubject = '' } = useParams();
  const navigate = useNavigate();
  const { user, setActivePage } = useApp();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.getSocialSubject(subSubject);
        if (response.success) setChild(response.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subSubject]);

  if (loading) return <div className="card" style={{ padding: '2rem' }}>Loading...</div>;
  if (!child) return <div className="card" style={{ padding: '2rem' }}>Social sub-subject not found.</div>;

  return (
    <div>
      <button className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => navigate('/subjects/social')}>
        <ArrowLeft size={16} /> Back to Social
      </button>
      <h1 className="title-main">{child.name}</h1>
      <YearSelector
        years={child.years || []}
        selectedYear={null}
        onSelect={(year) => {
          if (!user) {
            setActivePage('login');
            navigate('/login');
            return;
          }
          navigate(`/social/${child.slug}/${year}`);
        }}
      />
    </div>
  );
};

export const SubjectYearPracticePage: React.FC = () => {
  const { slug = '', year = '' } = useParams();
  const navigate = useNavigate();
  const { user, isLocked, setActivePage } = useApp();
  const [state, setState] = useState<{ loading: boolean; error: string; isPreview: boolean; questions: Question[]; subject: string }>({
    loading: true,
    error: '',
    isPreview: false,
    questions: [],
    subject: '',
  });

  useEffect(() => {
    if (!user) {
      setActivePage('login');
      navigate('/login');
      return;
    }

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const response = await api.getSubjectYearQuestions(slug, parseInt(year, 10));
        if (!response.success) {
          setState((prev) => ({ ...prev, loading: false, error: response.message || 'Unable to load questions.' }));
          return;
        }

        setState({
          loading: false,
          error: '',
          isPreview: Boolean(response.data?.isPreview),
          questions: mapApiQuestions(response, year),
          subject: response.data?.subject || slug,
        });
      } catch (error: any) {
        if (error?.status === 401) {
          setActivePage('login');
          navigate('/login');
          return;
        }
        setState((prev) => ({ ...prev, loading: false, error: error?.message || 'Payment required.' }));
      }
    };

    load();
  }, [slug, year, user, navigate, setActivePage]);

  if (!user) return null;

  if (state.error && isLocked(2)) {
    return (
      <LockedContent
        onPayNow={() => {
          setActivePage('membership');
          navigate('/membership');
        }}
      />
    );
  }

  return (
    <div>
      <PaymentBanner
        visible={state.isPreview}
        onUpgrade={() => {
          setActivePage('membership');
          navigate('/membership');
        }}
      />
      <QuestionViewer
        questions={state.questions}
        title={`${state.subject} ${year}`}
        subtitle={state.isPreview ? 'Showing free preview questions only.' : 'Full exam year unlocked.'}
        isPreview={state.isPreview}
        loading={state.loading}
        onBack={() => navigate(`/subjects/${slug}`)}
      />
    </div>
  );
};

export const SocialYearPracticePage: React.FC = () => {
  const { subSubject = '', year = '' } = useParams();
  const navigate = useNavigate();
  const { user, isLocked, setActivePage } = useApp();
  const [state, setState] = useState<{ loading: boolean; error: string; isPreview: boolean; questions: Question[]; subject: string }>({
    loading: true,
    error: '',
    isPreview: false,
    questions: [],
    subject: '',
  });

  useEffect(() => {
    if (!user) {
      setActivePage('login');
      navigate('/login');
      return;
    }

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: '' }));
      try {
        const response = await api.getSocialYearQuestions(subSubject, parseInt(year, 10));
        if (!response.success) {
          setState((prev) => ({ ...prev, loading: false, error: response.message || 'Unable to load questions.' }));
          return;
        }

        setState({
          loading: false,
          error: '',
          isPreview: Boolean(response.data?.isPreview),
          questions: mapApiQuestions(response, year),
          subject: response.data?.subject || subSubject,
        });
      } catch (error: any) {
        if (error?.status === 401) {
          setActivePage('login');
          navigate('/login');
          return;
        }
        setState((prev) => ({ ...prev, loading: false, error: error?.message || 'Payment required.' }));
      }
    };

    load();
  }, [subSubject, year, user, navigate, setActivePage]);

  if (!user) return null;

  if (state.error && isLocked(2)) {
    return (
      <LockedContent
        onPayNow={() => {
          setActivePage('membership');
          navigate('/membership');
        }}
      />
    );
  }

  return (
    <div>
      <PaymentBanner
        visible={state.isPreview}
        onUpgrade={() => {
          setActivePage('membership');
          navigate('/membership');
        }}
      />
      <QuestionViewer
        questions={state.questions}
        title={`${state.subject} ${year}`}
        subtitle={state.isPreview ? 'Showing free preview questions only.' : 'Full exam year unlocked.'}
        isPreview={state.isPreview}
        loading={state.loading}
        onBack={() => navigate(`/subjects/social/${subSubject}`)}
      />
    </div>
  );
};

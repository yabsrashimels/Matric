import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/questions';
import { api } from '../lib/api';
import { Calculator, Atom, Beaker, Dna, BookOpen, Cpu, Milestone, Globe, Shield, Coins } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const { progress, setActivePage, setSelectedSubject, isLocked, membershipPlan } = useApp();
  const [displaySubjects, setDisplaySubjects] = useState(SUBJECTS);

  const getSubjectIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'Calculator': return <Calculator size={size} />;
      case 'Atom': return <Atom size={size} />;
      case 'Beaker': return <Beaker size={size} />;
      case 'Dna': return <Dna size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Cpu': return <Cpu size={size} />;
      case 'Milestone': return <Milestone size={size} />;
      case 'Globe': return <Globe size={size} />;
      case 'Shield': return <Shield size={size} />;
      case 'Coins': return <Coins size={size} />;
      default: return <BookOpen size={size} />;
    }
  };

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const [subjectsRes, questionsRes] = await Promise.all([
          api.getSubjects(),
          api.getQuestions({ limit: 200 }),
        ]);

        const liveSubjects = Array.isArray(subjectsRes?.data) ? subjectsRes.data : [];
        const liveQuestions = Array.isArray(questionsRes?.data?.questions) ? questionsRes.data.questions : [];

        if (liveSubjects.length > 0) {
          const importedQuestions = await import('../data/questions');
          const staticQuestions = importedQuestions.QUESTIONS;

          const dbTexts = new Set(liveQuestions.map((q: any) => q.question));
          const uniqueStatic = staticQuestions.filter(q => !dbTexts.has(q.question));

          const combinedQuestions = [...liveQuestions, ...uniqueStatic];

          const questionCountBySubject = combinedQuestions.reduce((acc: Record<string, number>, question: any) => {
            const subjectName = question.subject_name || question.subject || 'General';
            const year = question.year;
            const sub = subjectName.toLowerCase();
            if (isLocked(2) && (
              (sub === 'mathematics' && [2014, 2015, 2016].includes(year)) ||
              (sub === 'physics' && [2014, 2015, 2016].includes(year))
            )) {
              return acc;
            }
            acc[subjectName] = (acc[subjectName] || 0) + 1;
            return acc;
          }, {});

          const mappedSubjects = liveSubjects.map((sub: any) => {
            const fallback = SUBJECTS.find((item) => item.name.toLowerCase() === String(sub.name || '').toLowerCase());
            return {
              id: String(sub.id),
              name: sub.name,
              icon: fallback?.icon || sub.icon || 'BookOpen',
              description: sub.description || fallback?.description || 'Live course content from your database.',
              questionCount: questionCountBySubject[sub.name] || fallback?.questionCount || 0,
              difficulty: fallback?.difficulty || 'Medium',
            };
          });

          setDisplaySubjects(mappedSubjects);
          return;
        }
      } catch (error) {
        console.warn('Unable to load live subjects, using bundled subject list.', error);
      }

      // Handle bundled QUESTION count (respects premium lock)
      import('../data/questions').then(({ QUESTIONS }) => {
        const premiumLockedSubjects = isLocked(2)
          ? QUESTIONS.filter(q => {
            const sub = q.subject.toLowerCase();
            return (
              (sub === 'mathematics' && [2014, 2015, 2016].includes(q.year)) ||
              (sub === 'physics' && [2014, 2015, 2016].includes(q.year))
            );
          })
          : [];

        const lockedTexts = new Set(premiumLockedSubjects.map(q => q.question));

        const visibleBySubject: Record<string, number> = {};
        QUESTIONS.forEach(q => {
          if (lockedTexts.has(q.question)) return;
          visibleBySubject[q.subject] = (visibleBySubject[q.subject] || 0) + 1;
        });

        setDisplaySubjects(SUBJECTS.map(s => ({
          ...s,
          questionCount: visibleBySubject[s.name] ?? s.questionCount
        })));
      });
    };

    loadSubjects();
  }, [isLocked, membershipPlan]);

  const handleStartSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setActivePage('practice');
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Grade 12 National Exam Subjects</h1>
        <p className="subtitle-main">
          Select any subject below to practice past matric questions, read syllabus-aligned explanations, and check your topic mastery.
        </p>
      </div>

      <div className="subjects-grid">
        {displaySubjects.map((sub) => {
          const solvedStats = progress.subjectProgress[sub.name] || { answered: 0, correct: 0 };
          const percentSolved = Math.round((solvedStats.answered / sub.questionCount) * 100) || 0;

          // Determine visual styling theme based on subject
          let iconColor = 'var(--ethio-green)';
          let bgColor = 'var(--accent-light)';

          if (sub.id === 'math' || sub.id === 'physics') {
            iconColor = 'var(--ethio-red)';
            bgColor = 'var(--danger-light)';
          } else if (sub.id === 'chemistry' || sub.id === 'biology') {
            iconColor = '#b45309';
            bgColor = 'var(--warning-light)';
          } else if (sub.id === 'history' || sub.id === 'geography') {
            iconColor = '#0284c7';
            bgColor = 'rgba(2, 132, 199, 0.1)';
          } else if (sub.id === 'civics' || sub.id === 'economics') {
            iconColor = '#7c3aed';
            bgColor = 'rgba(124, 58, 237, 0.1)';
          }

          return (
            <div className="card subject-card" key={sub.id} id={`subject-card-${sub.id}`}>
              <div className="subject-header">
                <div className="subject-icon-box" style={{ backgroundColor: bgColor, color: iconColor }}>
                  {getSubjectIcon(sub.icon)}
                </div>
                <span className={`subject-badge ${sub.difficulty.toLowerCase()}`}>{sub.difficulty}</span>
              </div>

              <h3>{sub.name}</h3>
              <p>{sub.description}</p>

              <div className="subject-meta">
                <span>{sub.questionCount} Exam Questions</span>
                <span style={{ color: percentSolved > 0 ? 'var(--ethio-green)' : 'inherit', fontWeight: '600' }}>
                  {percentSolved}% Solved
                </span>
              </div>

              <div className="subject-progress-container">
                <div className="subject-progress-label">
                  <span>Accuracy: {solvedStats.answered > 0 ? Math.round((solvedStats.correct / solvedStats.answered) * 100) : 0}%</span>
                  <span>{solvedStats.answered} / {sub.questionCount}</span>
                </div>
                <div className="subject-progress-bar">
                  <div
                    className="subject-progress-fill"
                    style={{
                      width: `${percentSolved}%`,
                      backgroundColor: percentSolved === 100 ? 'var(--ethio-green)' : iconColor
                    }}
                  ></div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => handleStartSubject(sub.name)}
              >
                {solvedStats.answered > 0 ? 'Continue Prep' : 'Begin Practice'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Gamification Tip Banner */}
      <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'linear-gradient(135deg, var(--accent-light), var(--warning-light))', border: '1px solid rgba(7, 137, 48, 0.2)' }}>
        <div style={{ fontSize: '2rem' }}>💡</div>
        <div>
          <h4 style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Level up your Matric Preparation!</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Each correct answer earns you <strong>+10 XP</strong>. Master entire subjects to unlock <strong>Subject Scholar badges</strong> and secure your spot on the local leaderboards!
          </p>
        </div>
      </div>
    </div>
  );
};

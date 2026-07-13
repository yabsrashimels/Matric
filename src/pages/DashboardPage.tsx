import React from 'react';
import { useApp } from '../context/AppContext';
import { BADGES, SUBJECTS } from '../data/questions';
import { Award, Flame, Zap, CheckCircle2, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { LeaderboardEntry } from '../types';

// Lazy-load premium panel to avoid increasing initial bundle size
const DashboardPremiumLazy = React.lazy(() => import('../components/Premium2014Panel').then(m => ({ default: m.Premium2014Panel })));


export const DashboardPage: React.FC = () => {
  const { progress } = useApp();

  // Statistics calculations
  const totalAnswered = progress.completedQuestionIds.length;
  const accuracyPercent = totalAnswered > 0 
    ? Math.round((progress.correctAnswersCount / (progress.correctAnswersCount + progress.wrongAnswersCount)) * 100) 
    : 0;

  // Level calculations
  const currentLevelXp = progress.xp % 100;
  const levelProgressPercent = Math.min(100, Math.round(currentLevelXp));

  // Daily Goal
  const dailyGoalPercent = Math.min(100, Math.round((progress.dailyXp / progress.dailyGoal) * 100));

  // Strong vs Weak subjects
  const subjectPerformanceList = SUBJECTS.map((sub) => {
    const stats = progress.subjectProgress[sub.name] || { answered: 0, correct: 0 };
    const ratio = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
    return {
      name: sub.name,
      ratio,
      answered: stats.answered
    };
  });

  const strongSubjects = subjectPerformanceList.filter(item => item.answered > 0 && item.ratio >= 65);
  const weakSubjects = subjectPerformanceList.filter(item => item.answered > 0 && item.ratio < 65);
  const unattemptedSubjects = subjectPerformanceList.filter(item => item.answered === 0);

  // Simulated local Ethiopian student leaderboard
  const mockLeaderboard: LeaderboardEntry[] = [
    { name: 'Samuel Alula', xp: 950, level: 10, avatar: '👨‍🎓' },
    { name: 'Selamawit Bekele', xp: 820, level: 9, avatar: '👩‍🎓' },
    { name: 'Aster Menelik', xp: 640, level: 7, avatar: '👩‍🎓' },
    { name: 'Kebede Chala', xp: 480, level: 5, avatar: '👨‍🎓' },
    { name: 'Yohannes Tesfaye', xp: 320, level: 4, avatar: '👨‍🎓' },
  ];

  // Insert current user dynamically according to their real-time XP
  const currentUserEntry: LeaderboardEntry = {
    name: 'You (Future Matric Scholar)',
    xp: progress.xp,
    level: progress.level,
    avatar: '⭐',
    isCurrentUser: true
  };

  const fullLeaderboard = [...mockLeaderboard, currentUserEntry]
    .sort((a, b) => b.xp - a.xp);

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Learning Dashboard</h1>
        <p className="subtitle-main">
          Track your preparation progress, review your achievements, and stay motivated as you move closer to exam readiness.
        </p>

        {/* Premium 2014 panel trigger */}
        <div style={{ marginTop: '0.75rem' }}>
          <small style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Premium content</small>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* The Premium2014Panel will handle fetching and showing results */}
            {/* Lazy-load the panel by dynamic import to keep initial bundle small */}
            <React.Suspense fallback={<div>Loading...</div>}>
              <DashboardPremiumLazy />
            </React.Suspense>
          </div>
        </div>
      </div>

      {/* Gamification Levels and Streak Header */}
      <div className="stats-container" style={{ marginBottom: '2.5rem' }}>
        <div className="card stats-card" style={{ gridColumn: 'span 2' }}>
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
            <Zap size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Level {progress.level} Scholar</h3>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {currentLevelXp} / 100 XP to Level {progress.level + 1}
              </span>
            </div>
            <div className="sidebar-xp-bar" style={{ height: '10px' }}>
              <div className="sidebar-xp-fill" style={{ width: `${levelProgressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: '#b45309' }}>
            <Flame size={24} />
          </div>
          <div className="stats-info">
            <h3>{progress.streak} Days</h3>
            <p>Study Streak</p>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--ethio-red)' }}>
            <Award size={24} />
          </div>
          <div className="stats-info">
            <h3>{progress.xp} XP</h3>
            <p>Total Experience Points</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Statistics vs Strong/Weak Areas */}
      <div className="practice-layout" style={{ marginBottom: '3rem' }}>
        {/* Left Side: General stats & Curriculum Strengths */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--ethio-green)' }} /> Practice Statistics
            </h3>
            <div className="stats-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{totalAnswered}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Questions Practiced</p>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--ethio-green)' }}>{progress.correctAnswersCount}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Correct Answers</p>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: accuracyPercent >= 60 ? 'var(--ethio-green)' : 'var(--ethio-red)' }}>{accuracyPercent}%</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accuracy Rate</p>
              </div>
            </div>

            {/* Daily Goal bar */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                <span>Daily Study Goal ({progress.dailyXp} / {progress.dailyGoal} XP)</span>
                <span>{dailyGoalPercent}%</span>
              </div>
              <div className="subject-progress-bar" style={{ height: '8px' }}>
                <div className="subject-progress-fill" style={{ width: `${dailyGoalPercent}%`, backgroundColor: 'var(--ethio-yellow)' }}></div>
              </div>
            </div>
          </div>

          {/* Strong vs Weak Subjects list */}
          <div className="card">
            <h3 style={{ fontWeight: '600', marginBottom: '1.25rem' }}>Subject Performance Overview</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ethio-green)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Strong subjects (Score ≥ 65%)
                </h4>
                {strongSubjects.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {strongSubjects.map((s, idx) => (
                      <span key={idx} className="meta-pill" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)', fontWeight: '600' }}>
                        {s.name} ({s.ratio}% Correct)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No strong subjects recorded yet. Keep practicing to build confidence.</p>
                )}
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ethio-red)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <ShieldAlert size={16} /> Weak subjects (Score &lt; 65%)
                </h4>
                {weakSubjects.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {weakSubjects.map((s, idx) => (
                      <span key={idx} className="meta-pill" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--ethio-red)', fontWeight: '600' }}>
                        {s.name} ({s.ratio}% Correct)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Great progress. Your current results look strong.</p>
                )}
              </div>

              {unattemptedSubjects.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    📚 Subjects to Explore
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {unattemptedSubjects.map((s, idx) => (
                      <span key={idx} className="meta-pill">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Local Leaderboard */}
        <div className="card">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--ethio-yellow)' }} /> Community Prep Leaderboard
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Earn experience points through mock exams and practice sessions to compare your progress with fellow students across the country.
          </p>
          
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Rank</th>
                <th>Student Name</th>
                <th style={{ textAlign: 'right' }}>XP</th>
                <th style={{ textAlign: 'right' }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {fullLeaderboard.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={idx} className={entry.isCurrentUser ? 'leaderboard-row current-user' : ''}>
                    <td>
                      <span className={`rank-badge rank-${rank}`}>
                        {rank}
                      </span>
                    </td>
                    <td style={{ fontWeight: entry.isCurrentUser ? '600' : '500' }}>
                      <span style={{ marginRight: '0.4rem' }}>{entry.avatar}</span>
                      {entry.name}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{entry.xp}</td>
                    <td style={{ textAlign: 'right', color: 'var(--ethio-green)', fontWeight: '600' }}>Lvl {entry.level}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accomplishments / Badges Locker */}
      <div className="card">
        <h3 style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={22} style={{ color: 'var(--ethio-green)' }} /> Achievement Locker
        </h3>
        <p className="subtitle-main" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          Reach new milestones, complete practice sets, and maintain your streak to unlock meaningful achievements.
        </p>

        <div className="badges-container">
          {BADGES.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`card badge-card ${isUnlocked ? 'unlocked' : ''}`} id={`badge-locker-${badge.id}`}>
                <div className="badge-icon-box">
                  <Award size={28} />
                </div>
                <h4>{badge.title}</h4>
                <p>{badge.description}</p>
                {isUnlocked ? (
                  <span className="badge-unlock-date">✓ Active Medal</span>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', fontWeight: '500' }}>
                    Req: {badge.requirement}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

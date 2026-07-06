import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Calendar, Plus, Info } from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const { progress, togglePlannerTask } = useApp();

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Weekly Study Planner</h1>
        <p className="subtitle-main">
          Stay organized. Complete daily curriculum tasks to cover all critical matric modules and earn bonus <strong>+15 XP</strong> per completed task.
        </p>
      </div>

      <div className="practice-layout">
        {/* Planner Lists */}
        <div className="card">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--ethio-green)' }} /> Weekly Curriculum Milestones
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            These modules align directly with the Ethiopian Grade 11 & 12 national syllabus guidelines. Check them off as you complete your daily review!
          </p>

          <div className="planner-list">
            {progress.studyPlanner.map((item) => (
              <div 
                key={item.id} 
                className="planner-item" 
                style={{ 
                  borderLeft: `4px solid ${item.completed ? 'var(--ethio-green)' : 'var(--ethio-yellow)'}`,
                  opacity: item.completed ? 0.75 : 1
                }}
              >
                <div className="planner-task-info">
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={() => togglePlannerTask(item.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--ethio-green)', cursor: 'pointer' }}
                    id={`planner-task-check-${item.id}`}
                  />
                  <div>
                    <p style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                      {item.task}
                    </p>
                    <span className="planner-day-tag" style={{ marginRight: '0.4rem' }}>{item.day}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.subject}</span>
                  </div>
                </div>

                {item.completed && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--ethio-green)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle2 size={14} /> +15 XP Claimed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informational Side Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--warning-light) 100%)', border: '1px solid rgba(7, 137, 48, 0.2)' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={18} style={{ color: 'var(--ethio-green)' }} /> Smart Study Tips
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                <strong>1. Spaced Repetition:</strong> Revisit your bookmarked incorrect questions every 2 days to lock concepts into long-term memory.
              </p>
              <p>
                <strong>2. Time Management:</strong> When practicing calculus or rotational motion, aim to complete calculations in under 45 seconds to prepare for actual exam limits.
              </p>
              <p>
                <strong>3. Mock Environment:</strong> Take at least one Full Mock Exam every Saturday under silent conditions without searching textbook folders.
              </p>
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <h4 style={{ fontWeight: '600', margin: '0.5rem 0' }}>Syllabus Coverage</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Completing this weekly agenda ensures coverage of over 85% of standard exam topics.
            </p>
            <div className="sidebar-xp-bar" style={{ height: '8px' }}>
              <div className="sidebar-xp-fill" style={{ width: `${Math.round((progress.studyPlanner.filter(t=>t.completed).length / progress.studyPlanner.length) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

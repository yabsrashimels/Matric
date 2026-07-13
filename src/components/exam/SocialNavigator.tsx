import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { YearSelector } from './YearSelector';

export interface SocialChild {
  slug: string;
  name: string;
  years: number[];
  questionCount?: number;
}

export interface SocialNavigatorProps {
  children: SocialChild[];
  selectedChild: string | null;
  selectedYear: number | null;
  onSelectChild: (slug: string, name: string) => void;
  onSelectYear: (year: number) => void;
  onBack?: () => void;
}

export const SocialNavigator: React.FC<SocialNavigatorProps> = ({
  children,
  selectedChild,
  selectedYear,
  onSelectChild,
  onSelectYear,
  onBack,
}) => {
  const activeChild = children.find((child) => child.slug === selectedChild);

  return (
    <div>
      {onBack && (
        <button className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={onBack}>
          <ArrowLeft size={16} /> Back to Subjects
        </button>
      )}

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2>Social Stream</h2>
        <p className="subtitle-main">Select a sub-subject, then choose an exam year.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {children.map((child) => (
            <button
              key={child.slug}
              className={`btn ${selectedChild === child.slug ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onSelectChild(child.slug, child.name)}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {activeChild && (
        <YearSelector
          years={activeChild.years}
          selectedYear={selectedYear}
          onSelect={onSelectYear}
          title={`${activeChild.name} — Select Exam Year`}
        />
      )}
    </div>
  );
};

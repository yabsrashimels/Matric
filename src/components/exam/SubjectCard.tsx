import React from 'react';
import { Calculator, Atom, Beaker, Dna, BookOpen, Cpu, Milestone, Globe, Shield, Coins } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator size={24} />,
  Atom: <Atom size={24} />,
  Beaker: <Beaker size={24} />,
  Dna: <Dna size={24} />,
  BookOpen: <BookOpen size={24} />,
  Cpu: <Cpu size={24} />,
  Milestone: <Milestone size={24} />,
  Globe: <Globe size={24} />,
  Shield: <Shield size={24} />,
  Coins: <Coins size={24} />,
};

export interface SubjectCardProps {
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  questionCount?: number;
  years?: number[];
  type?: 'flat' | 'nested';
  percentSolved?: number;
  accuracy?: number;
  answered?: number;
  onSelect: (slug: string, name: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  slug,
  name,
  icon = 'BookOpen',
  description,
  questionCount = 0,
  years = [],
  type = 'flat',
  percentSolved = 0,
  accuracy = 0,
  answered = 0,
  onSelect,
}) => {
  const yearLabel = years.length > 0 ? `${years[0]}–${years[years.length - 1]}` : 'No years yet';

  return (
    <div className="card subject-card" id={`subject-card-${slug}`}>
      <div className="subject-header">
        <div className="subject-icon-box" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
          {ICON_MAP[icon] || <BookOpen size={24} />}
        </div>
        <span className="subject-badge medium">{type === 'nested' ? 'Social Stream' : yearLabel}</span>
      </div>

      <h3>{name}</h3>
      <p>{description || `Practice ${name} past exam questions by year.`}</p>

      <div className="subject-meta">
        <span>{questionCount} Exam Questions</span>
        <span style={{ color: percentSolved > 0 ? 'var(--ethio-green)' : 'inherit', fontWeight: 600 }}>
          {percentSolved}% Solved
        </span>
      </div>

      <div className="subject-progress-container">
        <div className="subject-progress-label">
          <span>Accuracy: {accuracy}%</span>
          <span>{answered} / {questionCount}</span>
        </div>
        <div className="subject-progress-bar">
          <div className="subject-progress-fill" style={{ width: `${percentSolved}%` }} />
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => onSelect(slug, name)}>
        {answered > 0 ? 'Continue Prep' : 'Select Year'}
      </button>
    </div>
  );
};

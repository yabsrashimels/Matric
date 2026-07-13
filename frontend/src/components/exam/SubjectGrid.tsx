import React from 'react';
import { SubjectCard, SubjectCardProps } from './SubjectCard';

export interface SubjectGridItem extends Omit<SubjectCardProps, 'onSelect'> {}

export interface SubjectGridProps {
  subjects: SubjectGridItem[];
  onSelect: (slug: string, name: string) => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({ subjects, onSelect }) => {
  if (subjects.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No subjects available.</p>
      </div>
    );
  }

  return (
    <div className="subjects-grid">
      {subjects.map((subject) => (
        <SubjectCard key={subject.slug} {...subject} onSelect={onSelect} />
      ))}
    </div>
  );
};

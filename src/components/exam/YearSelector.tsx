import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface YearSelectorProps {
  years: number[];
  selectedYear: number | null;
  onSelect: (year: number) => void;
  title?: string;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  years,
  selectedYear,
  onSelect,
  title = 'Select Exam Year',
}) => {
  if (years.length === 0) {
    return <p className="subtitle-main">Year unavailable.</p>;
  }

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {years.map((year) => {
          const isActive = selectedYear === year;
          return (
            <button
              key={year}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => onSelect(year)}
            >
              <span>{year}</span>
              <ChevronDown size={16} style={{ opacity: isActive ? 1 : 0.5 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

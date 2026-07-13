import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

export interface LockedContentProps {
  onPayNow?: () => void;
  title?: string;
  message?: string;
}

export const LockedContent: React.FC<LockedContentProps> = ({
  onPayNow,
  title = 'Premium Content',
  message = 'This content is available only for paid users.',
}) => {
  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: 640, margin: '2rem auto' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Lock size={22} /> {title}
      </h2>
      <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.5rem' }}>{message}</p>

      <p style={{ marginBottom: '1rem' }}>
        Pay <strong>100 Birr once</strong> to unlock:
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', textAlign: 'left', maxWidth: 320, marginInline: 'auto' }}>
        {['All Subjects', 'Practical Center', 'Mock Exams', 'Previous Exams'].map((item) => (
          <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--ethio-green)' }} />
            {item}
          </li>
        ))}
      </ul>

      <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Payment Methods</p>
        <p>• Telebirr</p>
        <p>• CBE Birr</p>
      </div>

      <button className="btn btn-primary" onClick={onPayNow}>
        Pay Now
      </button>
    </div>
  );
};

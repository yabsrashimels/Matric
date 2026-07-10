import React from 'react';
import { Sparkles } from 'lucide-react';

export interface PaymentBannerProps {
  visible: boolean;
  onUpgrade: () => void;
}

export const PaymentBanner: React.FC<PaymentBannerProps> = ({ visible, onUpgrade }) => {
  if (!visible) return null;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(7,137,48,0.08), rgba(252,221,9,0.12))',
        border: '1px solid rgba(7,137,48,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Sparkles size={20} style={{ color: 'var(--ethio-green)' }} />
        <div>
          <strong>Free preview active</strong>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            You are viewing a limited sample. Pay 100 Birr once to unlock all questions permanently.
          </p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onUpgrade}>
        Upgrade
      </button>
    </div>
  );
};

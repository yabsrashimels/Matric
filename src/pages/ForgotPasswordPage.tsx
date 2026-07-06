import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ForgotPasswordPage: React.FC = () => {
  const { setActivePage, t } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulating forgot password trigger
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-page-container" id="forgot-password-page-root">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">🇪🇹</div>
          <h2>{t('forgotPasswordTitle')}</h2>
          <p>{t('forgotPasswordSubtitle')}</p>
        </div>

        {submitted ? (
          <div className="auth-success-banner" id="reset-success-message">
            <span className="success-icon">✉️</span>
            <p>
              If an account exists for <strong>{email}</strong>, we have sent password recovery instructions to your inbox.
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
              If you do not see the email shortly, please check your spam folder or try again with the correct address.
            </p>
            <button
              onClick={() => setActivePage('login')}
              className="auth-submit-btn"
              style={{ marginTop: '1.5rem' }}
            >
              {t('backToLogin')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
            <div className="form-group">
              <label htmlFor="reset-email">{t('emailLabel')}</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="reset-submit-btn"
            >
              {loading ? t('submitting') : t('sendResetLink')}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('login')}
              className="back-to-login-btn"
              style={{ display: 'block', margin: '1rem auto 0 auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
            >
              {t('backToLogin')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GoogleSignInButton } from '../components/ui/GoogleSignInButton';
import { signInWithGoogle } from '../lib/googleAuth';

export const LoginPage: React.FC = () => {
  const { login, t, setAuthSession } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const credential = await signInWithGoogle();
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google sign-in failed');
      if (data.success && data.data) {
        setAuthSession({ token: data.data.token, user: data.data.user });
        navigate('/progress');
      }
    } catch (err: any) {
      setError(err.message || 'We could not sign you in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please complete both fields to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.success) {
        if (data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/progress');
        }
      }
    } catch (err: any) {
      setError(err.message || 'We could not sign you in. Please review your email and password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container" id="login-page-root">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">🇪🇹</div>
          <h2>{t('welcomeBack')}</h2>
          <p>{t('signInSubtitle')}</p>
        </div>

        {error && (
          <div className="auth-error-banner" id="login-error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-group">
            <label htmlFor="login-email">{t('emailLabel')}</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="login-password">{t('passwordLabel')}</label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => navigate('/forgot-password')}
                id="forgot-password-trigger"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner-inline" /> {t('submitting')}
              </span>
            ) : t('login')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />

        <div className="auth-footer">
          <p>
            {t('dontHaveAccount')}{' '}
            <button
              onClick={() => navigate('/signup')}
              className="auth-toggle-link"
              id="goto-signup-btn"
            >
              {t('signup')}
            </button>
          </p>
          <div className="admin-demo-tip" style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '4px', fontSize: '0.75rem', border: '1px dashed var(--ethio-red)' }}>
            <strong>Demo access:</strong><br />
            {/* • Admin: yabsrashimels531@gmail.com / Yeabsra@123<br /> */}
            • Student: student@matricprep.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

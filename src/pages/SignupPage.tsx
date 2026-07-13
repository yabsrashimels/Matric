import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GoogleSignInButton } from '../components/ui/GoogleSignInButton';
import { signInWithGoogle } from '../lib/googleAuth';

export const SignupPage: React.FC = () => {
  const { signup, t, setAuthSession } = useApp();
  const navigate = useNavigate();

  // Registration States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('12');
  const [school, setSchool] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Simple international format checker e.g., +251912345678
  const validatePhone = (num: string): boolean => {
    const phoneRegex = /^\+\d{10,14}$/;
    return phoneRegex.test(num);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);
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
    setError(null);
    setSuccess(null);

    // Form Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please complete all required fields to create your account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please enter the same password in both fields.');
      return;
    }

    if (password.length < 6) {
      setError('Your password should be at least 6 characters long.');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter your phone number in international format, for example +251912345678.');
      return;
    }

    // Split Full Name into First and Last name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    setLoading(true);
    try {
      const data = await signup({
        email,
        password,
        firstName,
        lastName,
        grade,
        school,
        region,
        phone,
      });

      const payload = data?.data ?? data;
      const isSuccessful = data?.success === true || Boolean(payload?.token || payload?.user);

      if (isSuccessful) {
        setSuccess('Account created successfully. Please check your email for the verification code.');
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 1200);
      } else {
        setError(data?.message || 'We could not create your account. Please review your details and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'We could not create your account. Please review your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container" id="signup-page-root">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-icon-badge">🇪🇹</div>
          <h2>{t('registerTitle')}</h2>
          <p>{t('registerSubtitle')}</p>
        </div>

        {error && (
          <div className="auth-error-banner" id="signup-error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="auth-success-banner" id="signup-success-message">
            <span className="success-icon">✅</span>
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="signup-fullname">{t('fullNameLabel')} *</label>
              <input
                type="text"
                id="signup-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abebe Kebede"
                required
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="signup-phone">{t('phoneLabel')} *</label>
              <input
                type="text"
                id="signup-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251912345678"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">{t('emailLabel')} *</label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abebe@gmail.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="signup-grade">{t('gradeLabel')} *</label>
              <select
                id="signup-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              >
                <option value="12">Grade 12</option>
                <option value="11">Grade 11</option>
                <option value="10">Grade 10</option>
                <option value="9">Grade 9</option>
              </select>
            </div>
            <div className="form-group flex-2">
              <label htmlFor="signup-school">{t('schoolLabel')}</label>
              <input
                type="text"
                id="signup-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Bole High School"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-region">{t('regionLabel')}</label>
            <input
              type="text"
              id="signup-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Addis Ababa"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="signup-password">{t('passwordLabel')} *</label>
              <input
                type="password"
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="signup-confirmpassword">{t('confirmPasswordLabel')} *</label>
              <input
                type="password"
                id="signup-confirmpassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            id="signup-submit-btn"
          >
            {loading ? t('submitting') : t('signup')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <GoogleSignInButton onClick={handleGoogleSignUp} loading={googleLoading} />

        <div className="auth-footer">
          <p>
            {t('alreadyHaveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="auth-toggle-link"
              id="goto-login-btn"
            >
              {t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

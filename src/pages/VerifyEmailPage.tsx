import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const VerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialEmail = (location.state as { email?: string } | null)?.email || '';
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(60);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const nextCode = [...code];
        nextCode[index] = value;
        setCode(nextCode);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !code[index] && index > 0) {
            const nextCode = [...code];
            nextCode[index - 1] = '';
            setCode(nextCode);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyCode = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const otp = code.join('');
        if (otp.length !== 6) {
            setError('Please enter the full 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed');
            localStorage.setItem('ethio_token', data.data.token);
            localStorage.setItem('ethio_user', JSON.stringify(data.data.user));
            setSuccess('Email verified successfully. Redirecting to your dashboard...');
            setTimeout(() => navigate('/progress'), 900);
        } catch (err: any) {
            setError(err.message || 'We could not verify your email.');
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
        if (cooldown > 0) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to resend code');
            setSuccess('A fresh verification code has been sent.');
            setCooldown(60);
        } catch (err: any) {
            setError(err.message || 'We could not resend your code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card" style={{ maxWidth: '460px' }}>
                <div className="auth-header">
                    <div className="auth-icon-badge">✉️</div>
                    <h2>Verify Your Email</h2>
                    <p>We&apos;ve sent a 6-digit verification code to your email address. Enter it below to activate your account.</p>
                </div>

                {error && <div className="auth-error-banner"><span className="error-icon">⚠️</span><p>{error}</p></div>}
                {success && <div className="auth-success-banner"><span className="success-icon">✅</span><p>{success}</p></div>}

                <form onSubmit={verifyCode} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="verify-email">Email address</label>
                        <input id="verify-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" required />
                    </div>

                    <div className="otp-grid">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                value={digit}
                                onChange={(event) => handleCodeChange(index, event.target.value)}
                                onKeyDown={(event) => handleKeyDown(index, event)}
                                className="otp-input"
                                inputMode="numeric"
                                maxLength={1}
                                aria-label={`Verification digit ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Verifying…' : 'Verify Email'}
                    </button>
                </form>

                <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button type="button" className="auth-toggle-link" disabled={cooldown > 0 || loading} onClick={resendCode}>
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                    </button>
                    <button type="button" className="forgot-password-link" onClick={() => navigate('/signup')}>
                        Change Email
                    </button>
                </div>
            </div>
        </div>
    );
};

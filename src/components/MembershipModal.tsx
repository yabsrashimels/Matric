import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Award, AlertCircle, Sparkles } from 'lucide-react';

interface MembershipModalProps {
  plan: 'Premium' | 'Advanced';
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ plan, onClose }) => {
  const { user, submitPayment, loadPaymentHistory } = useApp();
  
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'CBE Birr'>('Telebirr');
  const [refNumber, setRefNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const instructions = {
    'Telebirr': 'Transfer the exact amount to Telebirr Wallet: +251900468152 (Account Holder: Ethiopian Matric Prep)',
    'CBE Birr': 'Transfer the exact amount to CBE Account: 1000706746734 (Holder Name: Ethiopian Matric Prep, CBE Bole Branch)'
  };

  const handleModalPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMsg(null);

    if (!user) {
      setPaymentMsg({ type: 'error', text: 'You must be logged in to upgrade.' });
      return;
    }

    if (!refNumber.trim()) {
      setPaymentMsg({ type: 'error', text: 'Please enter your 10-digit transaction reference number.' });
      return;
    }

    setPaymentLoading(true);
    try {
      const planId = plan === 'Premium' ? 2 : 3;
      await submitPayment(planId, paymentMethod, refNumber.trim(), screenshotUrl.trim());
      setPaymentMsg({ 
        type: 'success', 
        text: 'Your payment proof has been submitted successfully! An administrator will verify and unlock your account shortly.' 
      });
      setRefNumber('');
      setScreenshotUrl('');
      loadPaymentHistory();
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: err.message || 'Error submitting payment proof.' });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="custom-m-overlay" onClick={onClose} id="membership-modal-overlay">
      
      {/* Scope-isolated clean raw CSS - No Tailwind */}
      <style>{`
        .custom-m-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
          animation: mFadeIn 0.25s ease-out;
        }

        @keyframes mFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .custom-m-modal {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          position: relative;
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, sans-serif;
          animation: mSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes mSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .custom-m-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .custom-m-close:hover {
          background-color: var(--border-color);
          color: var(--text-primary);
          transform: rotate(90deg);
        }

        .custom-m-header {
          padding: 2.5rem 2.5rem 1.5rem 2.5rem;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--border-color);
        }

        .custom-m-header.premium-bg {
          background: linear-gradient(135deg, rgba(7, 137, 48, 0.08) 0%, rgba(252, 221, 9, 0.03) 100%);
        }

        .custom-m-header.advanced-bg {
          background: linear-gradient(135deg, rgba(252, 221, 9, 0.1) 0%, rgba(218, 18, 26, 0.03) 100%);
        }

        .custom-m-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          letter-spacing: 1px;
          margin-bottom: 0.75rem;
        }

        .custom-m-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .custom-m-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ethio-green);
        }

        .custom-m-price.adv {
          color: #d97706;
        }

        .custom-m-body {
          padding: 2rem 2.5rem;
        }

        .custom-m-bullets-title {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .custom-m-bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .custom-m-bullet-item {
          display: flex;
          gap: 0.75rem;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        /* Checkout Gateway Selection */
        .custom-m-checkout-box {
          background-color: var(--bg-tertiary);
          border: 1px dashed var(--border-color);
          border-radius: 20px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .custom-m-section-title {
          font-size: 0.95rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        .custom-m-gateway-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .custom-m-gateway-btn {
          padding: 0.85rem;
          border-radius: 12px;
          border: 2px solid var(--border-color);
          background-color: var(--bg-secondary);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .custom-m-gateway-btn.selected {
          border-color: var(--ethio-green);
          background-color: var(--accent-light);
          color: var(--ethio-green);
        }

        .custom-m-instructions {
          font-size: 0.85rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .custom-m-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .custom-m-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .custom-m-input-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .custom-m-input {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
        }

        .custom-m-input:focus {
          border-color: var(--ethio-green);
        }

        .custom-m-submit-btn {
          background-color: var(--ethio-green);
          color: white;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(7, 137, 48, 0.2);
        }

        .custom-m-submit-btn:hover:not(:disabled) {
          background-color: var(--ethio-green-hover);
          box-shadow: 0 6px 15px rgba(7, 137, 48, 0.3);
        }

        .custom-m-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Success & Error alerts */
        .custom-m-alert {
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .custom-m-alert.success {
          background-color: var(--accent-light);
          color: var(--ethio-green);
          border: 1px solid rgba(7, 137, 48, 0.25);
        }

        .custom-m-alert.error {
          background-color: var(--danger-light);
          color: var(--ethio-red);
          border: 1px solid rgba(218, 18, 26, 0.25);
        }
      `}</style>

      <div className="custom-m-modal" onClick={(e) => e.stopPropagation()} id="membership-modal-content">
        
        {/* Close Button */}
        <button className="custom-m-close" onClick={onClose} id="close-membership-modal-btn">
          <X size={18} />
        </button>

        {plan === 'Premium' ? (
          <>
            {/* PREMIUM MODAL PRESENTATION */}
            <div className="custom-m-header premium-bg">
              <span className="custom-m-badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--ethio-green)' }}>
                👑 PREMIUM TIER
              </span>
              <h2 className="custom-m-title">Unlock Your Full Learning Potential! 🚀</h2>
              <div className="custom-m-price">
                One-time payment: <strong>100 ETB</strong> • Lifetime Access
              </div>
            </div>

            <div className="custom-m-body">
              <div className="custom-m-bullets-title">
                <Award size={18} style={{ color: 'var(--ethio-green)' }} />
                What you unlock instantly:
              </div>
              <ul className="custom-m-bullets">
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>Get lifetime access to all Premium subjects and topics.</span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>Access detailed explanations and solutions.</span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>Take unlimited Premium mock exams.</span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>Track your progress with advanced analytics.</span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>Receive future Premium content updates for free.</span>
                </li>
              </ul>

              {/* Payment checkout panel inside modal */}
              <div className="custom-m-checkout-box">
                <h3 className="custom-m-section-title">Complete Your Premium Upgrade</h3>
                
                {paymentMsg && (
                  <div className={`custom-m-alert ${paymentMsg.type}`} id="modal-payment-alert">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <span>{paymentMsg.text}</span>
                  </div>
                )}

                {/* Method Toggle */}
                <div className="custom-m-gateway-row">
                  <button 
                    type="button" 
                    className={`custom-m-gateway-btn ${paymentMethod === 'Telebirr' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Telebirr')}
                    id="modal-select-telebirr-btn"
                  >
                    📱 Telebirr Wallet
                  </button>
                  <button 
                    type="button" 
                    className={`custom-m-gateway-btn ${paymentMethod === 'CBE Birr' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('CBE Birr')}
                    id="modal-select-cbe-btn"
                  >
                    🏦 CBE Birr
                  </button>
                </div>

                <div className="custom-m-instructions">
                  <strong>Payment Instruction:</strong>
                  <div style={{ marginTop: '0.4rem', color: 'var(--text-primary)', fontWeight: '600' }} id="modal-payment-details">
                    {instructions[paymentMethod]}
                  </div>
                </div>

                <form onSubmit={handleModalPaymentSubmit} className="custom-m-form" id="modal-payment-submission-form">
                  <div className="custom-m-input-group">
                    <label>Transaction ID / Reference Number *</label>
                    <input 
                      type="text" 
                      className="custom-m-input" 
                      placeholder="Enter your 10-digit reference ID"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="custom-m-input-group">
                    <label>Receipt or Screenshot URL (Optional)</label>
                    <input 
                      type="text" 
                      className="custom-m-input" 
                      placeholder="e.g. paste your image link"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="custom-m-submit-btn"
                    disabled={paymentLoading}
                    id="modal-payment-submit-btn"
                  >
                    {paymentLoading ? 'Submitting Transfer Proof...' : 'Upgrade to Premium Now'}
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ADVANCED MODAL PRESENTATION */}
            <div className="custom-m-header advanced-bg">
              <span className="custom-m-badge" style={{ backgroundColor: 'var(--warning-light)', color: '#b45309' }}>
                ⭐ ULTIMATE SUCCESS TIER
              </span>
              <h2 className="custom-m-title" style={{ background: 'linear-gradient(135deg, #b45309 0%, var(--ethio-red) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                The Ultimate Matric Success Package ⭐⭐⭐⭐⭐
              </h2>
              <div className="custom-m-price adv">
                One-time payment: <strong>500 ETB</strong> • Lifetime Access
              </div>
            </div>

            <div className="custom-m-body">
              <div className="custom-m-bullets-title">
                <Sparkles size={18} style={{ color: 'var(--ethio-yellow)', fill: 'var(--ethio-yellow)' }} />
                Everything included in Premium, plus:
              </div>
              <ul className="custom-m-bullets" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Everything included in Premium.</strong></span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Unlock every subject, topic, and future content.</strong></span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Access exclusive Advanced questions and explanations.</strong></span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Premium mock exams with detailed performance analysis.</strong></span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Early access to newly added learning materials.</strong></span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Priority support.</strong></span>
                </li>
                <li className="custom-m-bullet-item">
                  <Check size={16} style={{ color: 'var(--ethio-green)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span><strong>Lifetime access with all future updates included.</strong></span>
                </li>
              </ul>

              {/* Payment checkout panel inside modal */}
              <div className="custom-m-checkout-box" style={{ border: '2px dashed var(--ethio-yellow)' }}>
                <h3 className="custom-m-section-title">Complete Your Advanced Upgrade</h3>
                
                {paymentMsg && (
                  <div className={`custom-m-alert ${paymentMsg.type}`} id="modal-payment-alert-adv">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <span>{paymentMsg.text}</span>
                  </div>
                )}

                {/* Method Toggle */}
                <div className="custom-m-gateway-row">
                  <button 
                    type="button" 
                    className={`custom-m-gateway-btn ${paymentMethod === 'Telebirr' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Telebirr')}
                    id="modal-select-telebirr-btn-adv"
                  >
                    📱 Telebirr Wallet
                  </button>
                  <button 
                    type="button" 
                    className={`custom-m-gateway-btn ${paymentMethod === 'CBE Birr' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('CBE Birr')}
                    id="modal-select-cbe-btn-adv"
                  >
                    🏦 CBE Birr
                  </button>
                </div>

                <div className="custom-m-instructions">
                  <strong>Payment Instruction:</strong>
                  <div style={{ marginTop: '0.4rem', color: 'var(--text-primary)', fontWeight: '600' }} id="modal-payment-details-adv">
                    {instructions[paymentMethod]}
                  </div>
                </div>

                <form onSubmit={handleModalPaymentSubmit} className="custom-m-form" id="modal-payment-submission-form-adv">
                  <div className="custom-m-input-group">
                    <label>Transaction ID / Reference Number *</label>
                    <input 
                      type="text" 
                      className="custom-m-input" 
                      placeholder="Enter your 10-digit reference ID"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="custom-m-input-group">
                    <label>Receipt or Screenshot URL (Optional)</label>
                    <input 
                      type="text" 
                      className="custom-m-input" 
                      placeholder="e.g. paste your image link"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="custom-m-submit-btn"
                    style={{ background: 'linear-gradient(135deg, var(--ethio-yellow) 0%, #d97706 100%)', color: '#0f172a' }}
                    disabled={paymentLoading}
                    id="modal-payment-submit-btn-adv"
                  >
                    {paymentLoading ? 'Submitting Transfer Proof...' : 'Upgrade to Advanced Now'}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

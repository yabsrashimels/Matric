import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MembershipModal } from '../components/MembershipModal';
import { 
  Sparkles, Check, Lock, ArrowRight, ShieldCheck, 
  Star, Award, BookOpen, AlertCircle, Coins
} from 'lucide-react';

export const MembershipPage: React.FC = () => {
  const { 
    membershipPlan, 
    language 
  } = useApp();

  const activePlanId = membershipPlan?.plan_id || 1;
  const activePlanName = membershipPlan?.plan_name || 'Free';

  // Interactive UI states
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<'Premium' | 'Advanced' | null>(null);
  
  // Constants
  const PLAN_PERCENTAGES: Record<number, number> = {
    1: 20, // Free
    2: 85, // Premium
    3: 100 // Advanced
  };

  return (
    <div className="membership-container" id="membership-root">
      
      {/* Scope-isolated clean raw CSS - No Tailwind */}
      <style>{`
        .membership-container {
          padding: 1rem 0;
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .m-header-section {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .m-header-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, var(--ethio-green) 0%, var(--ethio-yellow) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .m-header-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Active Plan Indicator Ribbon */
        .m-active-badge-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .m-active-badge {
          background-color: var(--accent-light);
          color: var(--ethio-green);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(7, 137, 48, 0.2);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .m-active-badge.plan-3 {
          background-color: var(--warning-light);
          color: #b45309;
          border-color: rgba(252, 221, 9, 0.4);
        }

        /* Unlock Progress Tracker */
        .m-progress-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 4px 15px var(--shadow-color);
        }

        .m-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .m-progress-title {
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .m-progress-percent {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: var(--ethio-green);
          font-size: 1.1rem;
        }

        .m-progress-track {
          background-color: var(--bg-tertiary);
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 1px solid var(--border-color);
        }

        .m-progress-bar {
          background: linear-gradient(90deg, var(--ethio-green) 0%, var(--ethio-yellow) 70%, var(--ethio-red) 100%);
          height: 100%;
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .m-progress-footer {
          font-size: 0.825rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Plans Grid */
        .m-plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }

        @media (max-width: 992px) {
          .m-plans-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto 3rem auto;
          }
        }

        .m-plan-card {
          background-color: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          box-shadow: 0 4px 12px var(--shadow-color);
        }

        .m-plan-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px var(--shadow-hover);
        }

        .m-plan-card.premium-glow {
          border-color: var(--ethio-green);
        }

        .m-plan-card.advanced-glow {
          border-color: var(--ethio-yellow);
          background: radial-gradient(circle at top right, rgba(252, 221, 9, 0.05), var(--bg-secondary) 40%);
        }

        /* Ribbon / Badges */
        .m-card-ribbon {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          font-size: 0.725rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          letter-spacing: 0.5px;
        }

        .m-ribbon-popular {
          background-color: var(--accent-light);
          color: var(--ethio-green);
          border: 1px solid rgba(7, 137, 48, 0.3);
        }

        .m-ribbon-value {
          background-color: var(--warning-light);
          color: #b45309;
          border: 1px solid rgba(252, 221, 9, 0.4);
        }

        /* Card Header */
        .m-plan-tier {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 0.5rem;
        }

        .m-plan-name {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .m-price-container {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.5rem;
        }

        .m-price-amount {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .m-price-currency {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .m-price-period {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin-left: 0.25rem;
        }

        /* Features list */
        .m-features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 2.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex-grow: 1;
        }

        .m-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .m-feature-icon {
          margin-top: 0.15rem;
          flex-shrink: 0;
        }

        .m-feature-icon.unlocked {
          color: var(--ethio-green);
        }

        .m-feature-icon.locked {
          color: var(--text-tertiary);
          opacity: 0.5;
        }

        .m-feature-text.disabled {
          color: var(--text-tertiary);
          text-decoration: line-through;
          opacity: 0.75;
        }

        /* CTA buttons */
        .m-cta-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          border: none;
        }

        .m-btn-free {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .m-btn-free:hover {
          background-color: var(--border-color);
        }

        .m-btn-premium {
          background-color: var(--ethio-green);
          color: white;
          box-shadow: 0 4px 15px rgba(7, 137, 48, 0.2);
        }

        .m-btn-premium:hover {
          background-color: var(--ethio-green-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(7, 137, 48, 0.3);
        }

        .m-btn-advanced {
          background: linear-gradient(135deg, var(--ethio-yellow) 0%, #d97706 100%);
          color: #0f172a;
          box-shadow: 0 4px 15px rgba(252, 221, 9, 0.2);
        }

        .m-btn-advanced:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(252, 221, 9, 0.35);
        }

        .m-btn-current {
          background-color: var(--bg-tertiary);
          color: var(--text-tertiary);
          border: 2px dashed var(--border-color);
          cursor: not-allowed;
        }

        /* Features Matrix Comparison */
        .m-matrix-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 15px var(--shadow-color);
          margin-bottom: 3rem;
        }

        .m-matrix-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .m-table-wrapper {
          overflow-x: auto;
        }

        .m-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .m-table th, .m-table td {
          padding: 1.2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .m-table th {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .m-table tr:hover td {
          background-color: var(--bg-primary);
        }

        .m-feature-heading {
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .m-check-cell {
          text-align: center;
          width: 15%;
        }
      `}</style>

      {/* Header section */}
      <div className="m-header-section">
        <h1 className="m-header-title">Choose Your Learning Path</h1>
        <p className="m-header-subtitle">
          Select the support level that matches your preparation goals. Whether you are building confidence or aiming for top results, each plan is designed to strengthen your exam readiness.
        </p>

        {/* Current Active Plan Status */}
        <div className="m-active-badge-container">
          <span className={`m-active-badge plan-${activePlanId}`}>
            <ShieldCheck size={16} />
            CURRENT STATUS: <strong>{activePlanName.toUpperCase()} TIER</strong>
          </span>
        </div>
      </div>

      {/* Interactive Unlocked Content Tracker Progress bar */}
      <div className="m-progress-section">
        <div className="m-progress-header">
          <span className="m-progress-title">
            <Coins size={18} style={{ color: 'var(--ethio-yellow)' }} />
            Your Current Access Level
          </span>
          <span className="m-progress-percent">{PLAN_PERCENTAGES[activePlanId]}%</span>
        </div>
        <div className="m-progress-track">
          <div className="m-progress-bar" style={{ width: `${PLAN_PERCENTAGES[activePlanId]}%` }}></div>
        </div>
        <div className="m-progress-footer">
          <AlertCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span>
            {activePlanId === 1 && "You are on the Free plan. Upgrade to Premium or Advanced to unlock full exam practice resources and deeper study support."}
            {activePlanId === 2 && "You have strong access to core preparation tools. Upgrade to Advanced for broader coverage, richer practice materials, and more complete support."}
            {activePlanId === 3 && "You have full access to the platform's most complete learning resources and preparation support."}
          </span>
        </div>
      </div>

      {/* Plans Card Row */}
      <div className="m-plans-grid">
        
        {/* FREE TIER CARD */}
        <div 
          className="m-plan-card" 
          onMouseEnter={() => setHoveredPlan('free')}
          onMouseLeave={() => setHoveredPlan(null)}
          style={hoveredPlan === 'free' ? { transform: 'translateY(-8px)', borderColor: 'var(--border-color)', boxShadow: '0 12px 30px var(--shadow-hover)' } : {}}
        >
          <div className="m-plan-tier">Starter</div>
          <h2 className="m-plan-name">Free Access</h2>
          
          <div className="m-price-container">
            <span className="m-price-amount">0</span>
            <span className="m-price-currency">ETB</span>
            <span className="m-price-period">/ lifetime</span>
          </div>

          <ul className="m-features-list">
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Access core subjects and topics to begin your preparation</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Review the Grade 12 national syllabus structure</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Use a simple study planner to organize your revision</span>
            </li>
            <li className="m-feature-item">
              <Lock className="m-feature-icon locked" size={18} />
              <span className="m-feature-text disabled">Premium subject explanations & detailed steps</span>
            </li>
            <li className="m-feature-item">
              <Lock className="m-feature-icon locked" size={18} />
              <span className="m-feature-text disabled">Unlimited national mock exams simulator</span>
            </li>
            <li className="m-feature-item">
              <Lock className="m-feature-icon locked" size={18} />
              <span className="m-feature-text disabled">Detailed progress tracking & performance matrix</span>
            </li>
            <li className="m-feature-item">
              <Lock className="m-feature-icon locked" size={18} />
              <span className="m-feature-text disabled">Early access to newly added learning resources</span>
            </li>
          </ul>

          <button className="m-cta-btn m-btn-free" disabled={true}>
            {activePlanId === 1 ? 'Current Plan' : 'Start with Free Access'}
          </button>
        </div>

        {/* PREMIUM TIER CARD */}
        <div 
          className="m-plan-card premium-glow"
          onMouseEnter={() => setHoveredPlan('premium')}
          onMouseLeave={() => setHoveredPlan(null)}
          style={hoveredPlan === 'premium' ? { transform: 'translateY(-8px)', borderColor: 'var(--ethio-green)', boxShadow: '0 12px 30px rgba(7, 137, 48, 0.15)' } : {}}
        >
          <div className="m-card-ribbon m-ribbon-popular">Most Popular</div>
          <div className="m-plan-tier">Scholar Core</div>
          <h2 className="m-plan-name">Premium Learning</h2>
          
          <div className="m-price-container">
            <span className="m-price-amount">100</span>
            <span className="m-price-currency">ETB</span>
            <span className="m-price-period">/ lifetime</span>
          </div>

          <ul className="m-features-list">
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span><strong>Unlock deeper practice and stronger support</strong></span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Access a wider range of premium subjects and topics.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Receive detailed explanations and worked solutions.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Take unlimited mock exams to sharpen your exam readiness.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Monitor your progress with more detailed performance insights.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Receive future content updates as they are added.</span>
            </li>
            <li className="m-feature-item">
              <Lock className="m-feature-icon locked" size={18} />
              <span className="m-feature-text disabled">Exclusive expert-level questions and advanced explanations</span>
            </li>
          </ul>

          {activePlanId === 2 ? (
            <button className="m-cta-btn m-btn-current" disabled={true}>
              Active Premium Plan ✓
            </button>
          ) : activePlanId > 2 ? (
            <button className="m-cta-btn m-btn-free" disabled={true}>
              Unlocked via Advanced
            </button>
          ) : (
            <button 
              className="m-cta-btn m-btn-premium"
              onClick={() => setSelectedPlanDetails('Premium')}
            >
              Upgrade to Premium <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* ADVANCED TIER CARD */}
        <div 
          className="m-plan-card advanced-glow"
          onMouseEnter={() => setHoveredPlan('advanced')}
          onMouseLeave={() => setHoveredPlan(null)}
          style={hoveredPlan === 'advanced' ? { transform: 'translateY(-8px)', borderColor: 'var(--ethio-yellow)', boxShadow: '0 12px 30px rgba(252, 221, 9, 0.15)' } : {}}
        >
          <div className="m-card-ribbon m-ribbon-value">Best Value</div>
          <div className="m-plan-tier">Absolute Mastery</div>
          <h2 className="m-plan-name">Advanced Mastery</h2>
          
          <div className="m-price-container">
            <span className="m-price-amount">500</span>
            <span className="m-price-currency">ETB</span>
            <span className="m-price-period">/ lifetime</span>
          </div>

          <ul className="m-features-list">
            <li className="m-feature-item" style={{ color: 'var(--ethio-green)', fontWeight: '600' }}>
              <Star size={16} style={{ color: 'var(--ethio-yellow)', fill: 'var(--ethio-yellow)', marginTop: '0.15rem' }} />
              <strong>The complete package for ambitious matric students ⭐⭐⭐⭐⭐</strong>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Everything included in Premium, with even deeper support.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Access every subject, topic, and future learning material.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Practice with exclusive advanced questions and explanations.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Take premium mock exams with detailed performance feedback.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Early access to newly added learning materials.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Receive priority support whenever you need guidance.</span>
            </li>
            <li className="m-feature-item">
              <Check className="m-feature-icon unlocked" size={18} />
              <span>Lifetime access with all future updates included.</span>
            </li>
          </ul>

          {activePlanId === 3 ? (
            <button className="m-cta-btn m-btn-current" disabled={true}>
              Active Advanced Plan ★★★★★
            </button>
          ) : (
            <button 
              className="m-cta-btn m-btn-advanced"
              onClick={() => setSelectedPlanDetails('Advanced')}
            >
              Upgrade to Advanced <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>

      {/* Comprehensive Features Comparison Matrix */}
      <div className="m-matrix-section">
        <h2 className="m-matrix-title">Compare Features and Learning Support</h2>
        
        <div className="m-table-wrapper">
          <table className="m-table">
            <thead>
              <tr>
                <th>Feature / Benefit</th>
                <th style={{ textAlign: 'center' }}>Free</th>
                <th style={{ textAlign: 'center' }}>Premium (100 ETB)</th>
                <th style={{ textAlign: 'center' }}>Advanced (500 ETB)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    <BookOpen size={16} /> National Syllabus Syncing
                  </div>
                </td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    Daily Practice Limit
                  </div>
                </td>
                <td className="m-check-cell">25 Qs / Day</td>
                <td className="m-check-cell">Unlimited</td>
                <td className="m-check-cell">Unlimited</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    Detailed Formulas & Steps
                  </div>
                </td>
                <td className="m-check-cell" style={{ color: 'var(--text-tertiary)' }}>Limited</td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    National Mock Exams
                  </div>
                </td>
                <td className="m-check-cell" style={{ color: 'var(--text-tertiary)' }}>1 Trial Only</td>
                <td className="m-check-cell">Unlimited</td>
                <td className="m-check-cell">Unlimited</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    XP, Streaks, Leaderboards
                  </div>
                </td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    Study Planner Calendar
                  </div>
                </td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
                <td className="m-check-cell">✓</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    Progress Metrics & Strengths
                  </div>
                </td>
                <td className="m-check-cell" style={{ color: 'var(--text-tertiary)' }}>Basic</td>
                <td className="m-check-cell">✓ Advanced</td>
                <td className="m-check-cell">✓ Comprehensive</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading" style={{ color: '#d97706' }}>
                    <Star size={16} style={{ fill: '#fbbf24', color: '#fbbf24' }} /> Exclusive Hardest Mock Papers
                  </div>
                </td>
                <td className="m-check-cell">✕</td>
                <td className="m-check-cell">✕</td>
                <td className="m-check-cell">✓</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    Direct MOE Syllabi Updates
                  </div>
                </td>
                <td className="m-check-cell">✕</td>
                <td className="m-check-cell" style={{ color: 'var(--text-tertiary)' }}>Standard</td>
                <td className="m-check-cell">✓ Early Access</td>
              </tr>
              <tr>
                <td>
                  <div className="m-feature-heading">
                    24/7 Scholar Priority Assistance
                  </div>
                </td>
                <td className="m-check-cell">✕</td>
                <td className="m-check-cell">✕</td>
                <td className="m-check-cell">✓ Priority Support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* IMMERSIVE PLAN MODAL / CHECKOUT SCREEN (Strictly raw CSS + React JSX, No Tailwind) */}
      {selectedPlanDetails && (
        <MembershipModal 
          plan={selectedPlanDetails} 
          onClose={() => setSelectedPlanDetails(null)} 
        />
      )}

    </div>
  );
};

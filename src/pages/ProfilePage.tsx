import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MembershipModal } from '../components/MembershipModal';

export const ProfilePage: React.FC = () => {
  const { 
    user, 
    membershipPlan, 
    paymentHistory, 
    submitPayment, 
    loadPaymentHistory, 
    updateUserProfile, 
    t, 
    progress,
    setActivePage
  } = useApp();

  // Profile Edit fields
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [school, setSchool] = useState(user?.school || '');
  const [grade, setGrade] = useState(user?.grade || 12);
  const [region, setRegion] = useState(user?.region || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modal active plan selection state
  const [activeModalPlan, setActiveModalPlan] = useState<'Premium' | 'Advanced' | null>(null);

  // Payment states
  const [selectedPlan, setSelectedPlan] = useState<'Premium' | 'Advanced'>('Premium');
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'CBE Birr'>('Telebirr');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  // Keep state fields synced if the user context changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setSchool(user.school || '');
      setGrade(user.grade || 12);
      setRegion(user.region || '');
      setPhone(user.phone_number || '');
      setProfilePic(user.profile_picture || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        school,
        grade: parseInt(String(grade)),
        region,
        phone_number: phone,
        profile_picture: profilePic,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMsg(null);

    if (!referenceNumber.trim()) {
      setPaymentMsg({ type: 'error', text: 'Please enter the transaction reference number.' });
      return;
    }

    setPaymentLoading(true);
    try {
      const planId = selectedPlan === 'Premium' ? 2 : 3;
      await submitPayment(planId, paymentMethod, referenceNumber.trim(), screenshotUrl.trim());
      setPaymentMsg({ 
        type: 'success', 
        text: 'Payment receipt submitted successfully! Admin will review it shortly.' 
      });
      setReferenceNumber('');
      setScreenshotUrl('');
      loadPaymentHistory();
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: err.message || 'Failed to submit payment proof.' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const activePlanName = membershipPlan?.plan_name || 'Free';
  const activePlanId = membershipPlan?.plan_id || 1;

  // CBE & Telebirr instructions
  const instructions = {
    'Telebirr': 'Transfer the exact amount to Telebirr Wallet: +251900468152 (Account Holder: Ethiopian Matric Prep)',
    'CBE Birr': 'Transfer the exact amount to CBE Account: 1000706746734 (Holder Name: Ethiopian Matric Prep, CBE Bole Branch)'
  };

  return (
    <div className="profile-page-wrapper" id="profile-page-root">
      
      {/* 1. Academic & Personal profile card */}
      <div className="profile-grid">
        <div className="profile-card profile-info-card">
          <div className="profile-card-header">
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="Profile" 
                className="profile-avatar-img" 
                referrerPolicy="no-referrer"
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--ethio-red)' }}
              />
            ) : (
              <span className="profile-avatar-emoji">🎓</span>
            )}
            <div>
              <h3>{user?.first_name} {user?.last_name}</h3>
              <p className="email-text">{user?.email}</p>
            </div>
          </div>

          <hr className="profile-divider" />

          {profileMsg && (
            <div className={`profile-message ${profileMsg.type}`} id="profile-message-box">
              {profileMsg.text}
            </div>
          )}

          {!isEditing ? (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">{t('fullNameLabel')}:</span>
                <span className="detail-val">{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('phone')}:</span>
                <span className="detail-val">{user?.phone_number || 'Not Provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('gradeLabel')}:</span>
                <span className="detail-val">Grade {user?.grade}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('school')}:</span>
                <span className="detail-val">{user?.school || 'Not Provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('regionLabel')}:</span>
                <span className="detail-val">{user?.region || 'Not Provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('xp')}:</span>
                <span className="detail-val font-mono">{progress.xp} XP (Level {progress.level})</span>
              </div>

              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-profile-btn"
                id="edit-profile-btn"
              >
                {t('editProfile')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form" id="profile-edit-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('phone')}</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+251912345678" 
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>{t('gradeLabel')}</label>
                  <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                    <option value={12}>Grade 12</option>
                    <option value={11}>Grade 11</option>
                    <option value={10}>Grade 10</option>
                    <option value={9}>Grade 9</option>
                  </select>
                </div>
                <div className="form-group flex-2">
                  <label>{t('school')}</label>
                  <input 
                    type="text" 
                    value={school} 
                    onChange={(e) => setSchool(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('regionLabel')}</label>
                <input 
                  type="text" 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Profile Picture URL (Optional)</label>
                <input 
                  type="text" 
                  value={profilePic} 
                  onChange={(e) => setProfilePic(e.target.value)} 
                  placeholder="https://example.com/your-avatar.jpg"
                />
              </div>

              <div className="button-group">
                <button type="submit" className="save-btn">{t('saveChanges')}</button>
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">{t('cancel')}</button>
              </div>
            </form>
          )}
        </div>

        {/* 2. Membership status and Billing Plan panel */}
        <div className="profile-card billing-card">
          <div className="billing-header">
            <h3>{t('membershipStatus')}</h3>
            <span className={`tier-badge plan-id-${activePlanId}`}>
              {activePlanName.toUpperCase()} {t('lifetimeAccess').toUpperCase()}
            </span>
          </div>

          <hr className="profile-divider" />

          {activePlanId < 3 ? (
            <div className="billing-upgrade-section" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p className="upgrade-notice" style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Unlock your complete learning path with one of our high-value premium plans:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                {activePlanId < 2 && (
                  <button
                    type="button"
                    style={{
                      background: 'var(--ethio-green)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '1.1rem',
                      borderRadius: '14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(7, 137, 48, 0.25)',
                      transition: 'transform 0.2s ease'
                    }}
                    onClick={() => setActiveModalPlan('Premium')}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    👑 Upgrade to Premium (100 ETB)
                  </button>
                )}
                
                <button
                  type="button"
                  style={{
                    background: 'linear-gradient(135deg, var(--ethio-yellow) 0%, #d97706 100%)',
                    color: '#0f172a',
                    border: 'none',
                    padding: '1.1rem',
                    borderRadius: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(252, 221, 9, 0.25)',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => setActiveModalPlan('Advanced')}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  ⭐ Upgrade to Advanced (500 ETB)
                </button>

                <div style={{ margin: '1rem 0' }}>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActivePage('membership')}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Compare Features & Plans Matrix ➔
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="all-unlocked-banner">
              <span className="trophy-icon">🏆</span>
              <h4>Complete Access Active</h4>
              <p>You have unlocked the highest membership tier! All subjects, mock tests, premium math explanations, and analytics are fully accessible.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Detailed payment request history logs */}
      <div className="profile-card payment-history-card">
        <h3>{t('paymentHistory')}</h3>
        <hr className="profile-divider" />
        
        {paymentHistory.length === 0 ? (
          <p className="no-payments-text">No payment requests submitted yet. Complete a payment to upgrade your tier.</p>
        ) : (
          <div className="table-responsive">
            <table className="payment-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Requested Tier</th>
                  <th>Gateway</th>
                  <th>Ref Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>{item.plan_name}</td>
                    <td>{item.payment_method}</td>
                    <td className="font-mono text-xs">{item.reference_number}</td>
                    <td>
                      <span className={`status-pill ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                      {item.status === 'Rejected' && item.rejection_reason && (
                        <div className="rejection-reason-text">
                          Reason: {item.rejection_reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern CSS Modal trigger */}
      {activeModalPlan && (
        <MembershipModal 
          plan={activeModalPlan} 
          onClose={() => setActiveModalPlan(null)} 
        />
      )}

    </div>
  );
};

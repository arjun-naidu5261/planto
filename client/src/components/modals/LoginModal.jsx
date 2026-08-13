import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginModal() {
  const { showLogin, setShowLogin, loginPresetEmail, setLoginPresetEmail, loginUser, setShowProfileModal } = useApp();
  const [email, setEmail] = useState('customer@planto.in');
  const [password, setPassword] = useState('planto123');
  const [selectedRole, setSelectedRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoAccounts = [
    { 
      role: 'Customer', 
      email: 'customer@planto.in', 
      pass: 'planto123', 
      desc: 'Shop plants, track orders and enjoy our services',
      iconColor: '#e8f5e9',
      strokeColor: 'var(--primary-green)'
    },
    { 
      role: 'Vendor', 
      email: 'vendor@planto.in', 
      pass: 'planto123', 
      desc: 'Manage your stall, inventory and grow your business',
      iconColor: '#fff3e0',
      strokeColor: '#e65100'
    },
    { 
      role: 'Delivery Partner', 
      email: 'delivery@planto.in', 
      pass: 'planto123', 
      desc: 'Deliver orders and earn with PLANTO',
      iconColor: '#e1f5fe',
      strokeColor: '#0288d1'
    },
    { 
      role: 'Admin', 
      email: 'admin@planto.in', 
      pass: 'planto123', 
      desc: 'Manage platform, users and system settings',
      iconColor: '#ede7f6',
      strokeColor: '#5e35b1'
    }
  ];

  // Prefill when preset changes or modal is opened
  useEffect(() => {
    if (showLogin) {
      const preset = loginPresetEmail || 'customer@planto.in';
      setEmail(preset);
      const acc = demoAccounts.find(a => a.email === preset);
      if (acc) {
        setPassword(acc.pass);
        setSelectedRole(acc.role);
      }
    }
  }, [showLogin, loginPresetEmail]);

  if (!showLogin) return null;

  const handleRoleSelect = (acc) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMsg('');
  };

  const handleClose = () => {
    setShowLogin(false);
    setLoginPresetEmail(''); // Clear preset
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await loginUser(email, password);
    if (res.success) {
      setShowLogin(false);
      setLoginPresetEmail('');

      // Auto-redirect to appropriate dashboard
      const savedUser = localStorage.getItem('planto_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'Customer') window.location.hash = "#/profile";
        else if (parsed.role === 'Vendor') window.location.hash = "#/vendor";
        else if (parsed.role === 'Admin') window.location.hash = "#/admin";
        else if (parsed.role === 'Delivery Partner') window.location.hash = "#/delivery";
      }
    } else {
      setErrorMsg(res.message || "Invalid credentials.");
    }
  };

  const getRoleIconSvg = (role, strokeColor) => {
    switch (role) {
      case 'Customer':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'Vendor':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'Delivery Partner':
        return <span style={{ fontSize: '18px' }}>🛵</span>;
      case 'Admin':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay active" id="modal-login" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '900px', 
          width: '95%',
          padding: 0, 
          borderRadius: '24px', 
          overflow: 'hidden', 
          display: 'flex', 
          flexWrap: 'wrap',
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          border: 'none'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="close-modal" 
          id="login-close-btn" 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            background: '#f1f8f3',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#e8f5e9'; e.currentTarget.style.color = '#333'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#f1f8f3'; e.currentTarget.style.color = '#666'; }}
        >
          &times;
        </button>

        {/* Left Column: Role Selector & Branding */}
        <div style={{ flex: '1 1 420px', background: '#f5f9f6', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(0,0,0,0.04)' }}>
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <svg width="28" height="28" style={{ color: 'var(--primary-green)', fill: 'var(--primary-green)' }}><use href="#icon-leaf"></use></svg>
              <div>
                <strong style={{ fontSize: '20px', letterSpacing: '-0.5px', color: 'var(--primary-green)', display: 'block' }}>PLANTO</strong>
                <span style={{ fontSize: '9px', color: '#666', display: 'block', marginTop: '-2px' }}>Grow Better, Live Better</span>
              </div>
            </div>

            <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--dark)' }}>Welcome to PLANTO</h3>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '6px', lineHeight: '1.4' }}>
              Choose your account role to access your personalized dashboard and manage everything seamlessly.
            </p>

            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
              <span style={{ fontSize: '12px', color: 'var(--primary-green)' }}>🌿</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
            </div>

            {/* Roles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {demoAccounts.map(acc => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleRoleSelect(acc)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px 12px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid var(--primary-green)' : '1px solid rgba(0,0,0,0.06)',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: isSelected ? '0 8px 16px rgba(46,125,50,0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.border = '1px solid var(--primary-green)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.border = '1px solid rgba(0,0,0,0.06)';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    {/* Circle checkmark badge */}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>✓</div>
                    )}

                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: acc.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      {getRoleIconSvg(acc.role, acc.strokeColor)}
                    </div>
                    <strong style={{ fontSize: '13px', color: 'var(--dark)', display: 'block' }}>{acc.role}</strong>
                    <span style={{ fontSize: '9.5px', color: '#777', marginTop: '4px', lineHeight: '1.2' }}>{acc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Security Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1c4e20', color: 'white', padding: '12px 16px', borderRadius: '14px', marginTop: '24px', textAlign: 'left', boxShadow: '0 4px 12px rgba(28,78,32,0.15)' }}>
            <span style={{ fontSize: '18px' }}>🔒</span>
            <div>
              <strong style={{ fontSize: '11px', display: 'block', fontWeight: 700 }}>Your security is our priority</strong>
              <span style={{ fontSize: '9.5px', opacity: 0.85, display: 'block', marginTop: '2px' }}>All accounts are protected with industry-standard encryption.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div style={{ flex: '1 1 420px', background: '#ffffff', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
            
            {/* Lock Circle Icon */}
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 10px rgba(46,125,50,0.06)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dark)' }}>Secure Login</h3>
              
              {/* Shield Divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
                <div style={{ width: '30px', height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                <span style={{ fontSize: '12px', color: 'var(--primary-green)' }}>🛡️</span>
                <div style={{ width: '30px', height: '1px', background: 'rgba(0,0,0,0.06)' }} />
              </div>

              <p style={{ fontSize: '13px', color: '#666' }}>Sign in to your PLANTO account</p>
            </div>

            {errorMsg && (
              <div style={{
                color: '#d32f2f',
                background: '#ffebee',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: 600,
                border: '1px solid rgba(211,47,47,0.08)'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form id="login-auth-form" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '14px', color: '#888', display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input 
                    type="email" 
                    id="login-email"
                    required 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      const found = demoAccounts.find(a => a.email === e.target.value);
                      if (found) setSelectedRole(found.role);
                      else setSelectedRole('');
                    }} 
                    placeholder="name@planto.in" 
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px 12px 42px', 
                      borderRadius: '10px', 
                      border: '1px solid #e2e8f0', 
                      outline: 'none', 
                      fontSize: '14px',
                      fontFamily: 'var(--font-main)',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--primary-green)'}
                    onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '14px', color: '#888', display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="login-password"
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    style={{ 
                      width: '100%', 
                      padding: '12px 38px 12px 42px', 
                      borderRadius: '10px', 
                      border: '1px solid #e2e8f0', 
                      outline: 'none', 
                      fontSize: '14px',
                      fontFamily: 'var(--font-main)',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--primary-green)'}
                    onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#888',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#555' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-green)' }} />
                  Remember me
                </label>
                <a href="#/forgot-password" onClick={(e) => { e.preventDefault(); alert("Password reset link simulated. Please check your inbox!"); }} style={{ color: 'var(--primary-green)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  height: '48px', 
                  fontSize: '14.5px', 
                  borderRadius: '10px', 
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--secondary-green)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--primary-green)'; e.currentTarget.style.transform = 'none'; }}
              >
                Go to {selectedRole || 'Account'} Dashboard &rarr;
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
              <span style={{ fontSize: '10px', color: '#a0aec0', textTransform: 'uppercase', fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
            </div>

            <div style={{ fontSize: '13px', color: '#555', textAlign: 'center' }}>
              Don't have an account? <a href="#/signup" onClick={(e) => { e.preventDefault(); alert("Sign up flow coming soon! Please use the demo accounts for testing."); }} style={{ color: 'var(--primary-green)', textDecoration: 'none', fontWeight: 700 }}>Sign up now</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

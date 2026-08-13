import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginModal() {
  const { showLogin, setShowLogin, loginPresetEmail, setLoginPresetEmail, loginUser } = useApp();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  
  // Login State
  const [email, setEmail] = useState('customer@planto.in');
  const [password, setPassword] = useState('planto123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  useEffect(() => {
    if (showLogin) {
      const preset = loginPresetEmail || 'customer@planto.in';
      setEmail(preset);
      setPassword('planto123');
      setErrorMsg('');
    }
  }, [showLogin, loginPresetEmail]);

  if (!showLogin) return null;

  const handleClose = () => {
    setShowLogin(false);
    setLoginPresetEmail('');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await loginUser(email, password);
    if (res.success) {
      setShowLogin(false);
      setLoginPresetEmail('');
      window.location.hash = "#/profile";
    } else {
      setErrorMsg(res.message || "Invalid email or password.");
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    
    // Auto sign up & log in customer
    const res = await loginUser('customer@planto.in', 'planto123');
    if (res.success) {
      alert(`🎉 Welcome to PLANTO, ${signUpName}! Account created successfully.`);
      setShowLogin(false);
      window.location.hash = "#/profile";
    }
  };

  return (
    <div className="modal-overlay active" id="modal-login" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '460px', 
          width: '92%',
          padding: '36px', 
          borderRadius: '24px', 
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          border: 'none'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="close-modal" 
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
            justifyContent: 'center'
          }}
        >
          &times;
        </button>

        {/* Branding & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <svg width="32" height="32" style={{ color: 'var(--primary-green)', fill: 'var(--primary-green)' }}><use href="#icon-leaf"></use></svg>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-green)', letterSpacing: '-0.5px' }}>PLANTO</span>
          </div>
          <p style={{ fontSize: '13px', color: '#666' }}>Your Premium Smart Nursery Marketplace</p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div style={{ display: 'flex', background: '#f4fbf7', padding: '4px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #e8f5e9' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--primary-green)' : 'transparent',
              color: activeTab === 'login' ? '#ffffff' : '#555',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'signup' ? 'var(--primary-green)' : 'transparent',
              color: activeTab === 'signup' ? '#ffffff' : '#555',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div style={{
            color: '#d32f2f',
            background: '#ffebee',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12.5px',
            marginBottom: '18px',
            textAlign: 'center',
            fontWeight: 600,
            border: '1px solid rgba(211,47,47,0.1)'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="customer@planto.in" 
                style={{ 
                  width: '100%', 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0', 
                  outline: 'none', 
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{ 
                    width: '100%', 
                    padding: '12px 38px 12px 14px', 
                    borderRadius: '10px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px'
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#555' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-green)' }} />
                Remember me
              </label>
              <a href="#/forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your email!"); }} style={{ color: 'var(--primary-green)', textDecoration: 'none', fontWeight: 700 }}>Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                height: '46px', 
                fontSize: '15px', 
                borderRadius: '12px', 
                background: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                marginTop: '6px'
              }}
            >
              Sign In to PLANTO →
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ananya Sharma" 
                value={signUpName} 
                onChange={(e) => setSignUpName(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="ananya@example.com" 
                value={signUpEmail} 
                onChange={(e) => setSignUpEmail(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Mobile Number</label>
              <input 
                type="tel" 
                placeholder="+91 98765 43210" 
                value={signUpPhone} 
                onChange={(e) => setSignUpPhone(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="Create a strong password" 
                value={signUpPassword} 
                onChange={(e) => setSignUpPassword(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                height: '46px', 
                fontSize: '15px', 
                borderRadius: '12px', 
                background: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                marginTop: '8px'
              }}
            >
              Create Account & Start Shopping 🪴 →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

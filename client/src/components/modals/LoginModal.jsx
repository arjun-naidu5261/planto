import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function LoginModal() {
  const navigate = useNavigate();
  const { 
    showLogin, 
    setShowLogin, 
    loginPresetEmail, 
    setLoginPresetEmail, 
    loginUser, 
    sendWhatsAppOtp,
    verifyWhatsAppOtp,
    resendWhatsAppOtp
  } = useApp();
  
  // Main Tab: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('signup'); // Default to signup if user was trying to create account
  
  // Sign In Sub-mode: 'whatsapp' | 'password'
  const [loginMethod, setLoginMethod] = useState('whatsapp');

  // Sign In State - WhatsApp
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtpStep, setLoginOtpStep] = useState(1); // 1: phone, 2: otp
  const [loginOtp, setLoginOtp] = useState('');
  const [loginDisplayPhone, setLoginDisplayPhone] = useState('');
  const [loginResendTimer, setLoginResendTimer] = useState(0);

  // Sign In State - Password
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email or mobile
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Create Account State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1); // 1: form, 2: verify WhatsApp OTP
  const [signUpOtp, setSignUpOtp] = useState('');
  const [signUpDisplayPhone, setSignUpDisplayPhone] = useState('');
  const [signUpResendTimer, setSignUpResendTimer] = useState(0);

  // General Status & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loginOtpInputRef = useRef(null);
  const signUpOtpInputRef = useRef(null);

  // Countdown timers
  useEffect(() => {
    let interval = null;
    if (loginResendTimer > 0) {
      interval = setInterval(() => setLoginResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [loginResendTimer]);

  useEffect(() => {
    let interval = null;
    if (signUpResendTimer > 0) {
      interval = setInterval(() => setSignUpResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [signUpResendTimer]);

  useEffect(() => {
    if (showLogin) {
      if (loginPresetEmail) {
        setActiveTab('login');
        setLoginMethod('password');
        setLoginIdentifier(loginPresetEmail);
      }
      setLoginOtpStep(1);
      setLoginOtp('');
      setSignUpStep(1);
      setSignUpOtp('');
      setStatusMsg({ type: '', text: '' });
      setIsLoading(false);
    }
  }, [showLogin, loginPresetEmail]);

  useEffect(() => {
    if (loginOtpStep === 2 && loginOtpInputRef.current) {
      loginOtpInputRef.current.focus();
    }
  }, [loginOtpStep]);

  useEffect(() => {
    if (signUpStep === 2 && signUpOtpInputRef.current) {
      signUpOtpInputRef.current.focus();
    }
  }, [signUpStep]);

  if (!showLogin) return null;

  const handleClose = () => {
    setShowLogin(false);
    setLoginPresetEmail('');
    setStatusMsg({ type: '', text: '' });
    setLoginOtpStep(1);
    setSignUpStep(1);
  };

  // ===================== CREATE ACCOUNT (SIGN UP) HANDLERS =====================
  const handleSignUpInitiate = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!signUpName.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter your Full Name.' });
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid Email Address.' });
      return;
    }
    const cleanPhone = signUpPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid 10-digit Mobile Number.' });
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendWhatsAppOtp(signUpPhone, 'signup', signUpName.trim());
      setIsLoading(false);
      if (res.success) {
        setSignUpDisplayPhone(res.displayPhone || signUpPhone);
        setSignUpStep(2);
        setSignUpResendTimer(30);
        setStatusMsg({ 
          type: 'success', 
          text: `Verification code sent to WhatsApp (${res.displayPhone || signUpPhone})! 🌿` 
        });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to send WhatsApp verification code.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Error communicating with WhatsApp OTP server.' });
    }
  };

  const handleSignUpVerify = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!signUpOtp || signUpOtp.trim().length < 4) {
      setStatusMsg({ type: 'error', text: 'Please enter the 6-digit code received on WhatsApp.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyWhatsAppOtp({
        phone: signUpPhone,
        otp: signUpOtp.trim(),
        type: 'signup',
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword
      });
      setIsLoading(false);

      if (res.success) {
        setStatusMsg({ type: 'success', text: `Welcome to PlantMe, ${signUpName}! Account created successfully.` });
        setTimeout(() => {
          setShowLogin(false);
          setLoginPresetEmail('');
          navigate('/profile');
        }, 800);
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Incorrect verification code.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Error verifying WhatsApp OTP.' });
    }
  };

  const handleSignUpResendOtp = async () => {
    if (signUpResendTimer > 0 || isLoading) return;
    setStatusMsg({ type: '', text: '' });
    setIsLoading(true);
    try {
      const res = await resendWhatsAppOtp(signUpPhone, 'signup');
      setIsLoading(false);
      if (res.success) {
        setSignUpResendTimer(30);
        setStatusMsg({ type: 'success', text: 'New WhatsApp verification code sent!' });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to resend code.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to resend code.' });
    }
  };

  // ===================== SIGN IN HANDLERS =====================
  // 1. WhatsApp OTP Sign In
  const handleLoginSendOtp = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendWhatsAppOtp(loginPhone, 'login');
      setIsLoading(false);
      if (res.success) {
        setLoginDisplayPhone(res.displayPhone || loginPhone);
        setLoginOtpStep(2);
        setLoginResendTimer(30);
        setStatusMsg({ 
          type: 'success', 
          text: `Verification code sent to WhatsApp (${res.displayPhone || loginPhone})! 🌿` 
        });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to send WhatsApp OTP.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Error sending WhatsApp OTP.' });
    }
  };

  const handleLoginVerifyOtp = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!loginOtp || loginOtp.trim().length < 4) {
      setStatusMsg({ type: 'error', text: 'Please enter the 6-digit code received on WhatsApp.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyWhatsAppOtp({
        phone: loginPhone,
        otp: loginOtp.trim(),
        type: 'login'
      });
      setIsLoading(false);

      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Login successful! Redirecting...' });
        setTimeout(() => {
          setShowLogin(false);
          setLoginPresetEmail('');
          navigate('/profile');
        }, 700);
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Incorrect verification code.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Error verifying OTP.' });
    }
  };

  const handleLoginResendOtp = async () => {
    if (loginResendTimer > 0 || isLoading) return;
    setStatusMsg({ type: '', text: '' });
    setIsLoading(true);
    try {
      const res = await resendWhatsAppOtp(loginPhone, 'login');
      setIsLoading(false);
      if (res.success) {
        setLoginResendTimer(30);
        setStatusMsg({ type: 'success', text: 'Fresh verification code sent to WhatsApp!' });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to resend code.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to resend code.' });
    }
  };

  // 2. Password Sign In
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!loginIdentifier.trim() || !loginPassword) {
      setStatusMsg({ type: 'error', text: 'Please enter your Email/Mobile and Password.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginIdentifier.trim(), loginPassword);
      setIsLoading(false);
      if (res.success) {
        setShowLogin(false);
        setLoginPresetEmail('');
        navigate('/profile');
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Invalid email/mobile or password.' });
      }
    } catch (err) {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Login failed.' });
    }
  };

  return (
    <div className="modal-overlay active" id="modal-login" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '460px', 
          width: '92%',
          padding: '30px 26px', 
          borderRadius: '24px', 
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0,0,0,0.24)',
          border: 'none',
          fontFamily: 'inherit'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="close-modal" 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            zIndex: 10,
            background: '#f1f8f3',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          &times;
        </button>

        {/* Branding & Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
            <img src="/logo.png" alt="PlantMe" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, fontWeight: 500 }}>
            Hyperlocal Live Plant Delivery & Botanical Care
          </p>
        </div>

        {/* Top Switcher: Sign In vs Create Account */}
        <div style={{ 
          display: 'flex', 
          background: '#f1f8f3', 
          padding: '4px', 
          borderRadius: '12px', 
          marginBottom: '18px', 
          border: '1px solid #e2f0e6' 
        }}>
          <button
            type="button"
            onClick={() => { 
              setActiveTab('login'); 
              setLoginOtpStep(1); 
              setSignUpStep(1); 
              setStatusMsg({ type: '', text: '' }); 
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--primary-green, #1b4332)' : 'transparent',
              color: activeTab === 'login' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { 
              setActiveTab('signup'); 
              setSignUpStep(1); 
              setLoginOtpStep(1); 
              setStatusMsg({ type: '', text: '' }); 
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'signup' ? 'var(--primary-green, #1b4332)' : 'transparent',
              color: activeTab === 'signup' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {statusMsg.text && (
          <div style={{
            color: statusMsg.type === 'error' ? '#b91c1c' : '#15803d',
            background: statusMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12.5px',
            marginBottom: '15px',
            textAlign: 'center',
            fontWeight: 600,
            border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}>
            {statusMsg.type === 'error' ? '⚠️ ' : '✅ '}
            {statusMsg.text}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 1: CREATE ACCOUNT (SIGN UP) ===================== */}
        {/* ========================================================================= */}
        {activeTab === 'signup' && (
          <div>
            {/* STEP 1: FILL FORM & SUBMIT TO GET WHATSAPP OTP */}
            {signUpStep === 1 && (
              <form onSubmit={handleSignUpInitiate} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={signUpName} 
                    onChange={(e) => setSignUpName(e.target.value)} 
                    placeholder="e.g. Arjun Uddagiri" 
                    style={{ 
                      width: '100%', 
                      padding: '11px 13px', 
                      borderRadius: '10px', 
                      border: '1px solid #cbd5e1', 
                      outline: 'none', 
                      fontSize: '14px',
                      background: '#f8fafc'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={signUpEmail} 
                    onChange={(e) => setSignUpEmail(e.target.value)} 
                    placeholder="arjunuddagiri@futureforbes.in" 
                    style={{ 
                      width: '100%', 
                      padding: '11px 13px', 
                      borderRadius: '10px', 
                      border: '1px solid #cbd5e1', 
                      outline: 'none', 
                      fontSize: '14px',
                      background: '#f8fafc'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Mobile Number (WhatsApp)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '0 10px',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      color: '#334155'
                    }}>
                      🇮🇳 +91
                    </div>
                    <input 
                      type="tel" 
                      required 
                      value={signUpPhone} 
                      onChange={(e) => setSignUpPhone(e.target.value)} 
                      placeholder="88856 00899" 
                      style={{ 
                        flex: 1, 
                        padding: '11px 13px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1', 
                        outline: 'none', 
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type={showSignUpPassword ? "text" : "password"} 
                      required 
                      value={signUpPassword} 
                      onChange={(e) => setSignUpPassword(e.target.value)} 
                      placeholder="Create a password (min 6 characters)" 
                      style={{ 
                        width: '100%', 
                        padding: '11px 36px 11px 13px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1', 
                        outline: 'none', 
                        fontSize: '14px'
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px' }}
                    >
                      {showSignUpPassword ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Notice Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#166534',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '15px' }}>💬</span>
                  <span>A 6-digit verification code will be sent to your WhatsApp</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    height: '46px', 
                    fontSize: '14.5px', 
                    borderRadius: '12px', 
                    background: isLoading ? '#94a3b8' : 'var(--primary-green, #1b4332)',
                    color: 'white',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    marginTop: '4px',
                    boxShadow: '0 4px 14px rgba(27, 67, 50, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? 'Sending WhatsApp OTP...' : 'Create Account & Start Shopping →'}
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY WHATSAPP OTP */}
            {signUpStep === 2 && (
              <form onSubmit={handleSignUpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ 
                  textAlign: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  padding: '12px',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>OTP sent to WhatsApp:</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
                    {signUpDisplayPhone}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSignUpStep(1); setSignUpOtp(''); setStatusMsg({ type: '', text: '' }); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-green, #1b4332)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    ✏️ Change Mobile Number / Details
                  </button>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Enter 6-Digit WhatsApp Code
                  </label>
                  <input 
                    ref={signUpOtpInputRef}
                    type="text" 
                    maxLength="6"
                    required
                    value={signUpOtp} 
                    onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ''))} 
                    placeholder="• • • • • •" 
                    style={{ 
                      width: '100%', 
                      padding: '13px', 
                      borderRadius: '10px', 
                      border: '2px solid #25D366', 
                      outline: 'none', 
                      fontSize: '22px',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '8px',
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Didn't receive code?</span>
                  {signUpResendTimer > 0 ? (
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                      Resend in {signUpResendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignUpResendOtp}
                      disabled={isLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#25D366',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend WhatsApp OTP
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    height: '46px', 
                    fontSize: '14.5px', 
                    borderRadius: '12px', 
                    background: isLoading ? '#94a3b8' : 'var(--primary-green, #1b4332)',
                    color: 'white',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(27, 67, 50, 0.25)'
                  }}
                >
                  {isLoading ? 'Verifying & Setting up Account...' : 'Verify OTP & Complete Account Setup 🌿'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ===================== TAB 2: SIGN IN (OTP OR PASSWORD) ===================== */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <div>
            {/* Sub-Switch: Sign In with WhatsApp OTP vs Password */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setLoginMethod('whatsapp'); setStatusMsg({ type: '', text: '' }); }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: loginMethod === 'whatsapp' ? '2px solid #25D366' : '1px solid #cbd5e1',
                  background: loginMethod === 'whatsapp' ? '#f0fdf4' : '#ffffff',
                  color: loginMethod === 'whatsapp' ? '#166534' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>💬 WhatsApp OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setStatusMsg({ type: '', text: '' }); }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: loginMethod === 'password' ? '2px solid var(--primary-green, #1b4332)' : '1px solid #cbd5e1',
                  background: loginMethod === 'password' ? '#f1f8f3' : '#ffffff',
                  color: loginMethod === 'password' ? 'var(--primary-green, #1b4332)' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>🔑 Password</span>
              </button>
            </div>

            {/* METHOD A: SIGN IN VIA WHATSAPP OTP */}
            {loginMethod === 'whatsapp' && (
              <div>
                {loginOtpStep === 1 && (
                  <form onSubmit={handleLoginSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                        Mobile Number
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '0 10px',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: '#334155'
                        }}>
                          🇮🇳 +91
                        </div>
                        <input 
                          type="tel" 
                          required 
                          value={loginPhone} 
                          onChange={(e) => setLoginPhone(e.target.value)} 
                          placeholder="98856 00899" 
                          style={{ 
                            flex: 1, 
                            padding: '11px 13px', 
                            borderRadius: '10px', 
                            border: '1px solid #cbd5e1', 
                            outline: 'none', 
                            fontSize: '14.5px',
                            fontWeight: 600
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        You will receive an instant 6-digit OTP code on WhatsApp.
                      </span>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        height: '46px', 
                        fontSize: '14.5px', 
                        borderRadius: '12px', 
                        background: isLoading ? '#94a3b8' : '#25D366',
                        color: 'white',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 800,
                        marginTop: '4px',
                        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isLoading ? 'Sending WhatsApp OTP...' : 'Get WhatsApp OTP →'}
                    </button>
                  </form>
                )}

                {loginOtpStep === 2 && (
                  <form onSubmit={handleLoginVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ 
                      textAlign: 'center',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      padding: '12px',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>OTP sent to WhatsApp:</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
                        {loginDisplayPhone}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setLoginOtpStep(1); setLoginOtp(''); setStatusMsg({ type: '', text: '' }); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-green, #1b4332)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        ✏️ Change Mobile Number
                      </button>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Enter 6-Digit WhatsApp Code
                      </label>
                      <input 
                        ref={loginOtpInputRef}
                        type="text" 
                        maxLength="6"
                        required
                        value={loginOtp} 
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))} 
                        placeholder="• • • • • •" 
                        style={{ 
                          width: '100%', 
                          padding: '13px', 
                          borderRadius: '10px', 
                          border: '2px solid #25D366', 
                          outline: 'none', 
                          fontSize: '22px',
                          fontWeight: 800,
                          textAlign: 'center',
                          letterSpacing: '8px',
                          color: '#0f172a',
                          background: '#ffffff'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Didn't receive code?</span>
                      {loginResendTimer > 0 ? (
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                          Resend in {loginResendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLoginResendOtp}
                          disabled={isLoading}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#25D366',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Resend WhatsApp OTP
                        </button>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        height: '46px', 
                        fontSize: '14.5px', 
                        borderRadius: '12px', 
                        background: isLoading ? '#94a3b8' : 'var(--primary-green, #1b4332)',
                        color: 'white',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 800,
                        marginTop: '4px',
                        boxShadow: '0 4px 14px rgba(27, 67, 50, 0.25)'
                      }}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Sign In 🌿'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* METHOD B: SIGN IN VIA PASSWORD */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Email or Mobile Number
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={loginIdentifier} 
                    onChange={(e) => setLoginIdentifier(e.target.value)} 
                    placeholder="Enter your email or 10-digit mobile" 
                    style={{ 
                      width: '100%', 
                      padding: '11px 13px', 
                      borderRadius: '10px', 
                      border: '1px solid #cbd5e1', 
                      outline: 'none', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      required 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      placeholder="Enter your password" 
                      style={{ 
                        width: '100%', 
                        padding: '11px 36px 11px 13px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1', 
                        outline: 'none', 
                        fontSize: '14px'
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showLoginPassword ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    height: '46px', 
                    fontSize: '14.5px', 
                    borderRadius: '12px', 
                    background: 'var(--primary-green, #1b4332)',
                    color: 'white',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    marginTop: '4px',
                    boxShadow: '0 4px 14px rgba(27, 67, 50, 0.25)'
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In with Password →'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

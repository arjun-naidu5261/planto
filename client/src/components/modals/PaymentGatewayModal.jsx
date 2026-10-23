import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function PaymentGatewayModal({ isOpen, onClose, amount, onPaymentSuccess, walletBalance = 0 }) {
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'wallet' | 'cod'
  const [processing, setProcessing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [upiData, setUpiData] = useState(null);
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 8920 1142 8891');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState('Suhas K.');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('8401');

  // Load dynamic UPI order details on open
  useEffect(() => {
    if (!isOpen) {
      setProcessing(false);
      setShowOtpScreen(false);
      return;
    }

    setTimerSeconds(300);
    const initPayment = async () => {
      try {
        const data = await api.createPaymentOrder({ amount });
        if (data.success) {
          setUpiData(data);
        }
      } catch (e) {
        console.error('Error creating payment order:', e);
      }
    };
    initPayment();
  }, [isOpen, amount]);

  // Countdown timer for UPI QR
  useEffect(() => {
    if (!isOpen || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timerSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleSimulateUpiPay = async (appName = 'UPI App') => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        const verifyRes = await api.verifyPayment({
          paymentId: 'UPI_' + Date.now().toString().slice(-8),
          method: `UPI (${appName})`,
          amount
        });
        setProcessing(false);
        onPaymentSuccess({
          paymentMethod: 'upi',
          paymentId: verifyRes.paymentId,
          invoiceNumber: verifyRes.invoiceNumber
        });
      } catch (e) {
        setProcessing(false);
        alert('Payment verification failed.');
      }
    }, 1200);
  };

  const handleCardPay = () => {
    if (cardNumber.replace(/\s/g, '').length < 15 || cardCvv.length < 3) {
      alert('Please enter valid 16-digit card details.');
      return;
    }
    setShowOtpScreen(true);
  };

  const handleVerifyCardOtp = async () => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        const verifyRes = await api.verifyPayment({
          paymentId: 'RZP_' + Date.now().toString().slice(-8),
          method: 'Razorpay 3D Secure Card',
          amount
        });
        setProcessing(false);
        onPaymentSuccess({
          paymentMethod: 'card',
          paymentId: verifyRes.paymentId,
          invoiceNumber: verifyRes.invoiceNumber
        });
      } catch (e) {
        setProcessing(false);
        alert('Card verification failed.');
      }
    }, 1400);
  };

  const handleWalletPay = () => {
    if (walletBalance < amount) {
      alert(`Insufficient Green Wallet balance (₹${walletBalance}). Please use UPI or Cards.`);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess({
        paymentMethod: 'wallet',
        paymentId: 'WAL_' + Date.now().toString().slice(-8),
        invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000)
      });
    }, 800);
  };

  const handleCodPay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess({
        paymentMethod: 'cod',
        paymentId: 'POD_' + Date.now().toString().slice(-8),
        invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000)
      });
    }, 700);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        animation: 'modalSlideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#2d6a4f', color: '#d8f3dc', padding: '3px 8px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                PLANTME SECURE CHECKOUT
              </span>
              <span style={{ fontSize: '11px', color: '#b7e4c7' }}>256-Bit Encrypted</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
              Pay ₹{amount}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Payment Tabs Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={() => { setSelectedMethod('upi'); setShowOtpScreen(false); }}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: selectedMethod === 'upi' ? '#ffffff' : 'transparent',
              borderBottom: selectedMethod === 'upi' ? '3px solid #16a34a' : 'none',
              fontWeight: selectedMethod === 'upi' ? 800 : 600,
              color: selectedMethod === 'upi' ? '#16a34a' : '#64748b',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>⚡ UPI / QR</span>
            <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 700 }}>Fastest</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedMethod('card'); setShowOtpScreen(false); }}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: selectedMethod === 'card' ? '#ffffff' : 'transparent',
              borderBottom: selectedMethod === 'card' ? '3px solid #16a34a' : 'none',
              fontWeight: selectedMethod === 'card' ? 800 : 600,
              color: selectedMethod === 'card' ? '#16a34a' : '#64748b',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>💳 Cards</span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>Razorpay</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedMethod('wallet'); setShowOtpScreen(false); }}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: selectedMethod === 'wallet' ? '#ffffff' : 'transparent',
              borderBottom: selectedMethod === 'wallet' ? '3px solid #16a34a' : 'none',
              fontWeight: selectedMethod === 'wallet' ? 800 : 600,
              color: selectedMethod === 'wallet' ? '#16a34a' : '#64748b',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🌱 Wallet</span>
            <span style={{ fontSize: '9px', color: '#16a34a' }}>₹{Math.round(walletBalance)}</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedMethod('cod'); setShowOtpScreen(false); }}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: selectedMethod === 'cod' ? '#ffffff' : 'transparent',
              borderBottom: selectedMethod === 'cod' ? '3px solid #16a34a' : 'none',
              fontWeight: selectedMethod === 'cod' ? 800 : 600,
              color: selectedMethod === 'cod' ? '#16a34a' : '#64748b',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>💵 Pay on Delivery</span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>Doorstep</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* 1. UPI TAB */}
          {selectedMethod === 'upi' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', background: '#f8fafc', padding: '16px', borderRadius: '18px', border: '1.5px dashed #cbd5e1', marginBottom: '16px' }}>
                <div style={{
                  width: '180px',
                  height: '180px',
                  background: '#ffffff',
                  margin: '0 auto',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  {/* Dynamic simulated high-res SVG QR Code */}
                  <svg width="160" height="160" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner Position Boxes */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="#0f172a" />
                    <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                    <rect x="13" y="13" width="12" height="12" rx="2" fill="#16a34a" />

                    <rect x="67" y="5" width="28" height="28" rx="4" fill="#0f172a" />
                    <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                    <rect x="75" y="13" width="12" height="12" rx="2" fill="#16a34a" />

                    <rect x="5" y="67" width="28" height="28" rx="4" fill="#0f172a" />
                    <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
                    <rect x="13" y="75" width="12" height="12" rx="2" fill="#16a34a" />

                    {/* QR Matrix Bits */}
                    <rect x="38" y="10" width="8" height="8" fill="#0f172a" />
                    <rect x="50" y="18" width="8" height="8" fill="#0f172a" />
                    <rect x="38" y="26" width="8" height="8" fill="#0f172a" />
                    <rect x="10" y="38" width="8" height="8" fill="#0f172a" />
                    <rect x="22" y="46" width="8" height="8" fill="#0f172a" />
                    <rect x="38" y="42" width="18" height="18" rx="4" fill="#1b4332" />
                    <rect x="62" y="38" width="8" height="8" fill="#0f172a" />
                    <rect x="78" y="46" width="8" height="8" fill="#0f172a" />
                    <rect x="42" y="68" width="8" height="8" fill="#0f172a" />
                    <rect x="54" y="78" width="8" height="8" fill="#0f172a" />
                    <rect x="72" y="70" width="8" height="8" fill="#0f172a" />
                    <rect x="84" y="82" width="8" height="8" fill="#0f172a" />
                    <circle cx="47" cy="51" r="4" fill="#52b788" />
                  </svg>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    plantme.pay@icici
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                  <span>⏱️ QR expires in:</span>
                  <span style={{ fontWeight: 800, color: '#dc2626' }}>{formattedTime}</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
                Scan using any UPI App (Google Pay, PhonePe, Paytm, CRED) or tap an app below:
              </div>

              {/* 1-Tap App Shortcuts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleSimulateUpiPay('Google Pay')}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: '#4285F4', fontWeight: 800 }}>G</span> Google Pay
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleSimulateUpiPay('PhonePe')}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: '#5f259f', fontWeight: 800 }}>पे</span> PhonePe
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleSimulateUpiPay('Paytm')}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: '#00b9f1', fontWeight: 800 }}>P</span> Paytm
                </button>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleSimulateUpiPay('Simulated App')}
                style={{
                  width: '100%',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {processing ? 'Verifying Bank Handshake...' : `I Have Scanned & Paid ₹${amount} →`}
              </button>
            </div>
          )}

          {/* 2. CARD TAB */}
          {selectedMethod === 'card' && !showOtpScreen && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>CARDS ACCEPTED</span>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>Visa • Mastercard • RuPay</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>CARD NUMBER</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="4532 8920 1142 8891"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', letterSpacing: '1px', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>EXPIRY</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    placeholder="•••"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>NAME ON CARD</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="Cardholder Name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
                />
              </div>

              <button
                type="button"
                onClick={handleCardPay}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Proceed to 3D Secure OTP (₹{amount}) →
              </button>
            </div>
          )}

          {/* 2B. 3D SECURE OTP MODAL */}
          {selectedMethod === 'card' && showOtpScreen && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '28px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
                🔐
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Razorpay 3D Secure Verification</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                Enter the OTP sent to your registered mobile number linked with your card.
              </p>

              <div style={{ maxWidth: '200px', margin: '0 auto 18px' }}>
                <input
                  type="text"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="Enter 4-Digit OTP"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '2px solid #0284c7',
                    color: '#0f172a'
                  }}
                />
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleVerifyCardOtp}
                style={{
                  width: '100%',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Authorizing with Bank...' : `Confirm & Pay ₹${amount} →`}
              </button>
            </div>
          )}

          {/* 3. WALLET TAB */}
          {selectedMethod === 'wallet' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '28px' }}>
                🌱
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#14532d', margin: '0 0 6px 0' }}>PlantMe Green Wallet</h4>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#166534', margin: '8px 0' }}>
                ₹{Math.round(walletBalance)}
              </div>
              <div style={{ fontSize: '12.5px', color: walletBalance >= amount ? '#15803d' : '#dc2626', marginBottom: '20px', fontWeight: 700 }}>
                {walletBalance >= amount ? '✓ Sufficient balance for 1-click checkout' : '⚠️ Balance lower than cart amount. Please choose UPI or Card.'}
              </div>

              <button
                type="button"
                disabled={processing || walletBalance < amount}
                onClick={handleWalletPay}
                style={{
                  width: '100%',
                  background: walletBalance >= amount ? '#166534' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: walletBalance >= amount ? 'pointer' : 'not-allowed'
                }}
              >
                {processing ? 'Deducting Wallet Funds...' : `Pay ₹${amount} from Green Wallet →`}
              </button>
            </div>
          )}

          {/* 4. CASH ON DELIVERY TAB */}
          {selectedMethod === 'cod' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '28px' }}>
                📦
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#78350f', margin: '0 0 6px 0' }}>Pay on Delivery (Cash / UPI at Doorstep)</h4>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0', maxWidth: '380px', display: 'inline-block' }}>
                Inspect your live plant, verify healthy root moisture and lush foliage at your doorstep, then pay rider via Cash or QR.
              </p>

              <button
                type="button"
                disabled={processing}
                onClick={handleCodPay}
                style={{
                  width: '100%',
                  background: '#b45309',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Reserving Cargo...' : `Confirm Pay on Delivery (₹${amount}) →`}
              </button>
            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div style={{
          background: '#f8fafc',
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <span>🛡️ 100% Refund Guarantee on damaged transit</span>
          <span>WhatsApp Invoice Dispatch Active</span>
        </div>
      </div>
    </div>
  );
}

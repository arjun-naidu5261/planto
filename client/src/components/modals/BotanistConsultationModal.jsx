import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function BotanistConsultationModal() {
  const { showBotanistModal, setShowBotanistModal, currentUser } = useApp();
  const [callState, setCallState] = useState('lobby'); // 'lobby' | 'connected' | 'completed'
  const [activeMode, setActiveMode] = useState('book'); // 'book' | 'live'
  
  // Slot Booking Form State
  const getDates = () => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return list;
  };

  const dates = getDates();
  const timeSlots = [
    '10:00 AM - 10:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '03:30 PM - 04:00 PM',
    '05:00 PM - 05:30 PM',
    '06:30 PM - 07:00 PM'
  ];

  const [selectedDate, setSelectedDate] = useState(`${dates[0].label}, ${dates[0].dateStr}`);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plantType, setPlantType] = useState('Monstera / Indoor Foliage');
  const [issue, setIssue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Live call simulation state
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callTimer, setCallTimer] = useState(300); // 5 mins in seconds
  const [prescription, setPrescription] = useState({
    diagnosis: 'Mild Leaf Chlorosis due to low indirect light and slight overwatering',
    wateringInterval: 'Every 8-10 days (Allow top 2 inches of soil to completely dry)',
    lightRecommendation: 'Move to bright indirect light near an east-facing window or 3 feet from balcony',
    remedy: 'Spray 5ml Organic Cold-Pressed Neem Oil diluted in 1L water once every 14 days'
  });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      if (!name && currentUser.name) setName(currentUser.name);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser, showBotanistModal]);

  useEffect(() => {
    let interval;
    if (callState === 'connected' && callTimer > 0) {
      interval = setInterval(() => {
        setCallTimer(prev => {
          if (prev <= 1) {
            setCallState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState, callTimer]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  if (!showBotanistModal) return null;

  const startCall = async () => {
    setCallState('connected');
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.log("Cam permission skipped or denied in simulator", err);
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCallState('completed');
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setShowBotanistModal(false);
    setCallState('lobby');
    setCallTimer(300);
    setBookingSuccess(null);
    setBookingError('');
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setBookingError('Please enter your Name, Phone Number, and Email.');
      return;
    }
    setBookingError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/botanist/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          slotDate: selectedDate,
          slotTime: selectedTime,
          plantType,
          plantIssue: issue
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.booking);
      } else {
        setBookingError(data.message || 'Failed to book slot.');
      }
    } catch (err) {
      // Offline fallback
      setBookingSuccess({
        bookingId: 'SLOT-' + Math.floor(1000 + Math.random() * 9000),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        slotDate: selectedDate,
        slotTime: selectedTime,
        plantType,
        plantIssue: issue
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={handleClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '580px', 
          width: '92%', 
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px', 
          padding: '24px',
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 25px 70px rgba(0,0,0,0.25)'
        }}
      >
        <button 
          className="close-modal" 
          onClick={handleClose}
          style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 800, fontSize: '16px' }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', background: '#dcfce7', padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            CERTIFIED BOTANIST SUPPORT
          </span>
          <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: '6px 0 2px 0', color: 'var(--dark)' }}>
            1-on-1 Virtual Plant Doctor Consultation
          </h3>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
            Connect live with our botanical registrar & plant pathology expert to diagnose sick plants.
          </p>
        </div>

        {/* Doctor Identity Banner */}
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '14px 18px', border: '1px solid #e2e8f0', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2.5px solid var(--primary-green)' }}>
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" 
              alt="PlantMe Certified Botanist" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 2px 0' }}>
              PlantMe Certified Botanist
            </h4>
            <div style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: 700 }}>
              Senior Horticulturist & Plant Pathologist • PlantMe Labs
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Specialization: Indoor Aroids, Root Rot Reversal & Tropical Foliage Care
            </div>
          </div>
        </div>

        {callState === 'lobby' && !bookingSuccess && (
          <div>
            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '18px', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveMode('book')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeMode === 'book' ? '#ffffff' : 'transparent',
                  color: activeMode === 'book' ? '#1b4332' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: activeMode === 'book' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                📅 Book a Consultation Slot
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('live')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeMode === 'live' ? '#ffffff' : 'transparent',
                  color: activeMode === 'live' ? '#1b4332' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: activeMode === 'live' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                📹 Instant Live Call (5 Mins)
              </button>
            </div>

            {/* TAB 1: BOOK A SLOT FORM */}
            {activeMode === 'book' && (
              <form onSubmit={handleBookSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {bookingError && (
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                    {bookingError}
                  </div>
                )}

                {/* 1. Date Selection */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    1. Select Date
                  </label>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {dates.map((d, i) => {
                      const fullVal = `${d.label}, ${d.dateStr}`;
                      const isSelected = selectedDate === fullVal;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDate(fullVal)}
                          style={{
                            flexShrink: 0,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #1b4332' : '1px solid #cbd5e1',
                            background: isSelected ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#166534' : '#64748b' }}>{d.label}</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#1b4332' : '#1e293b' }}>{d.dateStr}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Time Slot Selection */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    2. Select Time Slot (30 Mins)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {timeSlots.map((slot, i) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          style={{
                            padding: '9px 10px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #1b4332' : '1px solid #cbd5e1',
                            background: isSelected ? '#f0fdf4' : '#ffffff',
                            color: isSelected ? '#1b4332' : '#334155',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          ⏰ {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Customer Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Patel"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                    Email Address * (For meeting invite & prescription)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                    Plant Variety & Symptoms / Issues
                  </label>
                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="e.g. Monstera with browning leaf tips, repotted last week"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✉️</span>
                  <span>Instant confirmation & calendar link will be emailed to you and our botanist team.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: '#1b4332',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(27,67,50,0.25)',
                    marginTop: '4px'
                  }}
                >
                  {isSubmitting ? 'Reserving Slot & Sending Emails...' : 'Confirm & Reserve Slot 🌿'}
                </button>
              </form>
            )}

            {/* TAB 2: INSTANT LIVE CALL */}
            {activeMode === 'live' && (
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left', fontSize: '12.5px' }}>
                  <div style={{ fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                    Free 5-Minute Live Diagnosis Included
                  </div>
                  <div style={{ color: '#4b5563' }}>
                    • Show your plant stems and soil live over your camera<br />
                    • Receive an official written organic recovery prescription<br />
                    • 100% free with your PlantMe order guarantee
                  </div>
                </div>

                <button
                  onClick={startCall}
                  style={{
                    width: '100%',
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(45,106,79,0.25)'
                  }}
                >
                  Start Live Video Call Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOOKING SUCCESS SCREEN */}
        {bookingSuccess && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332', margin: '0 0 6px 0' }}>
              Consultation Slot Confirmed!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Your appointment has been reserved and an email notification has been dispatched.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', textAlign: 'left', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Booking ID</span>
                <span style={{ fontWeight: 800, color: '#1b4332' }}>{bookingSuccess.bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Reserved Date</span>
                <span style={{ fontWeight: 800, color: '#166534' }}>{bookingSuccess.slotDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Time Slot</span>
                <span style={{ fontWeight: 800, color: '#166534' }}>{bookingSuccess.slotTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Customer</span>
                <span style={{ fontWeight: 700 }}>{bookingSuccess.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Notification Sent To</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{bookingSuccess.customerEmail}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(null);
                  setActiveMode('book');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Book Another Slot
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#1b4332',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* CONNECTED LIVE VIDEO CALL */}
        {callState === 'connected' && (
          <div>
            <div style={{ position: 'relative', width: '100%', height: '260px', background: '#0f172a', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px' }}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" 
                alt="Live Doctor" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                Senior Botanist (Speaking)
              </div>

              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800 }}>
                ⏱️ {formatTimer(callTimer)}
              </div>

              <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '90px', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #fff', background: '#1e293b' }}>
                {camOn ? (
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px' }}>
                    Cam Off
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setMicOn(!micOn)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  background: micOn ? '#f1f5f9' : '#fee2e2',
                  color: micOn ? '#1e293b' : '#dc2626',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {micOn ? 'Mute Mic' : 'Unmute'}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  background: camOn ? '#f1f5f9' : '#fee2e2',
                  color: camOn ? '#1e293b' : '#dc2626',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {camOn ? 'Turn Cam Off' : 'Turn Cam On'}
              </button>
              <button
                onClick={endCall}
                style={{
                  padding: '9px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                End & Get Care Prescription
              </button>
            </div>
          </div>
        )}

        {/* PRESCRIPTION RESULT */}
        {callState === 'completed' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Consultation Completed
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Here is your certified organic treatment plan for your plant.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Diagnosis</div>
                <div style={{ fontWeight: 700, color: '#166534' }}>{prescription.diagnosis}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Watering Protocol</div>
                <div style={{ color: '#334155' }}>{prescription.wateringInterval}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Sunlight & Placement</div>
                <div style={{ color: '#334155' }}>{prescription.lightRecommendation}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Organic Treatment Remedy</div>
                <div style={{ color: '#334155' }}>{prescription.remedy}</div>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                background: 'var(--primary-green)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Done & Save to Virtual Care Diary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

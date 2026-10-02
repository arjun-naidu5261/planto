import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function BotanistConsultationModal() {
  const { showBotanistModal, setShowBotanistModal } = useApp();
  const [callState, setCallState] = useState('lobby'); // 'lobby' | 'connected' | 'completed'
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
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-overlay active" onClick={handleClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '560px', 
          width: '92%', 
          borderRadius: '20px', 
          padding: '24px',
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        <button 
          className="close-modal" 
          onClick={handleClose}
          style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 800 }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', background: '#dcfce7', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
            CERTIFIED BOTANIST SUPPORT
          </span>
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: '6px 0 2px 0', color: 'var(--dark)' }}>
            1-on-1 Virtual Plant Doctor Consultation
          </h3>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
            Connect live with our botanical registrar & plant pathology expert to diagnose sick plants.
          </p>
        </div>

        {callState === 'lobby' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 12px', overflow: 'hidden', border: '3px solid var(--primary-green)' }}>
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" 
                  alt="Dr. Priya Nair" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: '0 0 2px 0' }}>
                Dr. Priya Nair, Ph.D.
              </h4>
              <div style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: 700 }}>
                Senior Horticulturist & Plant Pathologist • PlantMe Labs
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
                Specialization: Indoor Aroids, Root Rot Reversal & Tropical Foliage Care
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '12.5px' }}>
              <div style={{ fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                Free 5-Minute Consultation Included
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
                padding: '13px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Start Live Video Call Now →
            </button>
          </div>
        )}

        {callState === 'connected' && (
          <div>
            {/* Live Video Room Simulation */}
            <div style={{ position: 'relative', width: '100%', height: '260px', background: '#0f172a', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px' }}>
              {/* Remote Horticulturist Stream */}
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" 
                alt="Live Doctor" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Doctor Label Badge */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                Dr. Priya Nair (Speaking)
              </div>

              {/* Countdown Timer */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800 }}>
                ⏱️ {formatTimer(callTimer)}
              </div>

              {/* Local User Camera PIP */}
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

            {/* In-Call Controls */}
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
                Here is Dr. Priya Nair's certified organic treatment plan for your plant.
              </p>
            </div>

            {/* Official Prescription Card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Diagnosis</div>
                <div style={{ fontWeight: 700, color: '#166534' }}>{prescription.diagnosis}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Watering Schedule</div>
                <div style={{ color: '#334155' }}>{prescription.wateringInterval}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Light Adjustment</div>
                <div style={{ color: '#334155' }}>{prescription.lightRecommendation}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Recommended Organic Remedy</div>
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
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Save Prescription to My Garden →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function LiveOrderTrackerModal({ isOpen, onClose, orderId }) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTracking = async () => {
      try {
        const idToFetch = orderId || 'ORD-7290';
        const data = await api.getLiveTracking(idToFetch);
        if (isMounted && data.success) {
          setTrackingData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch live tracking:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 3000); // 3-second live sync

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const data = trackingData || {
    orderId: orderId || 'ORD-7290',
    status: 'Preparing',
    stageIndex: 1,
    deliveryOtp: '8204',
    pickupPin: '4819',
    etaMinutes: 14,
    items: [{ name: 'Premium Golden Pothos (Money Plant)', quantity: 1, price: 180 }],
    total: 279,
    address: 'Flat 402, Green Heights, 100ft Road, Indiranagar, Bengaluru',
    vendorName: 'PlantMe Certified Local Nursery - Indiranagar',
    riderCoords: { lat: 12.9732, lng: 77.6414, heading: 45 },
    rider: {
      name: 'Ramu Prasad',
      phone: '+91 98450 11223',
      rating: 4.9,
      vehicle: 'Hero Electric Scooter • KA-05-EQ-8821',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    timeline: []
  };

  const stages = [
    { title: 'Order Placed', desc: 'Plant verified & payment processed' },
    { title: 'Nursery Preparing', desc: 'Selecting fresh foliage & hydrating roots' },
    { title: 'Packed in Eco-Crate', desc: 'Awaiting Rider 4-digit Pickup PIN handover' },
    { title: 'Rider In Transit', desc: 'Ramu Prasad is cruising to your location' },
    { title: 'Delivered', desc: 'Doorstep OTP verified & 30-Day Guarantee active' }
  ];

  // Determine stage index
  let stageIdx = data.stageIndex;
  if (data.status === 'Placed') stageIdx = 0;
  else if (data.status === 'Preparing') stageIdx = 1;
  else if (data.status === 'Ready for Pickup') stageIdx = 2;
  else if (data.status === 'Picked Up') stageIdx = 3;
  else if (data.status === 'Delivered') stageIdx = 4;

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(data.deliveryOtp || '8204');
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(5px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          zIndex: 10,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                ● LIVE 20-MIN TRACKING
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Order #{data.orderId}</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              {stageIdx >= 3 ? 'Rider En Route with your Plant!' : 'Nursery Preparing Foliage & Eco-Crate'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Live Animated Map Section */}
          <div style={{
            background: 'linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)',
            borderRadius: '20px',
            padding: '20px',
            position: 'relative',
            height: '240px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {/* Visual Road Map Canvas Mockup */}
            <svg width="100%" height="100%" viewBox="0 0 500 200" style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* City grid roads */}
              <line x1="20" y1="60" x2="480" y2="60" stroke="#ffffff" strokeWidth="6" opacity="0.7" />
              <line x1="20" y1="140" x2="480" y2="140" stroke="#ffffff" strokeWidth="6" opacity="0.7" />
              <line x1="120" y1="10" x2="120" y2="190" stroke="#ffffff" strokeWidth="5" opacity="0.7" />
              <line x1="260" y1="10" x2="260" y2="190" stroke="#ffffff" strokeWidth="5" opacity="0.7" />
              <line x1="390" y1="10" x2="390" y2="190" stroke="#ffffff" strokeWidth="5" opacity="0.7" />

              {/* Live Transit Route Curve */}
              <path
                d="M 80 140 Q 250 40 420 140"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="5"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* Nursery Store Marker (Origin) */}
              <g transform="translate(80, 140)">
                <circle cx="0" cy="0" r="16" fill="#15803d" />
                <circle cx="0" cy="0" r="24" fill="#15803d" opacity="0.25">
                  <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="0" y="5" fill="#fff" fontSize="14" textAnchor="middle">🌿</text>
                <text x="0" y="32" fill="#0f172a" fontSize="11" fontWeight="800" textAnchor="middle">NURSERY</text>
              </g>

              {/* Delivery Partner Marker (Dynamic Position) */}
              {stageIdx >= 3 ? (
                <g transform="translate(250, 90)">
                  <circle cx="0" cy="0" r="18" fill="#0284c7" />
                  <circle cx="0" cy="0" r="28" fill="#38bdf8" opacity="0.3">
                    <animate attributeName="r" values="18;32;18" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="0" y="6" fill="#fff" fontSize="15" textAnchor="middle">🛵</text>
                  <rect x="-45" y="-36" width="90" height="20" rx="10" fill="#0f172a" />
                  <text x="0" y="-23" fill="#ffffff" fontSize="9.5" fontWeight="800" textAnchor="middle">RAMU (RIDER)</text>
                </g>
              ) : (
                <g transform="translate(100, 110)">
                  <circle cx="0" cy="0" r="14" fill="#64748b" />
                  <text x="0" y="5" fill="#fff" fontSize="12" textAnchor="middle">🛵</text>
                  <text x="0" y="-12" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle">Arriving at Nursery</text>
                </g>
              )}

              {/* Customer Destination Marker */}
              <g transform="translate(420, 140)">
                <circle cx="0" cy="0" r="16" fill="#dc2626" />
                <circle cx="0" cy="0" r="24" fill="#f87171" opacity="0.25">
                  <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="0" y="5" fill="#fff" fontSize="14" textAnchor="middle">🏡</text>
                <text x="0" y="32" fill="#0f172a" fontSize="11" fontWeight="800" textAnchor="middle">YOUR HOME</text>
              </g>
            </svg>

            {/* Overlay ETA floating pill */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#15803d', display: 'block' }}>
                  {stageIdx === 4 ? 'Order Delivered!' : `Arriving in ~${data.etaMinutes || 12} mins`}
                </strong>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                  {stageIdx >= 3 ? 'Live GPS Broadcaster Active' : 'Eco-Safe Hydration Packaging'}
                </span>
              </div>
            </div>

            {/* Coordinates Stream Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}>
              GPS: {data.riderCoords?.lat?.toFixed(4) || '12.9732'}, {data.riderCoords?.lng?.toFixed(4) || '77.6414'}
            </div>
          </div>

          {/* 2. 🔐 Customer Delivery OTP Highlight Card */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔐</span>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#a7f3d0' }}>
                  Doorstep Verification Security
                </span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '6px 0 2px 0' }}>
                Share Delivery OTP Upon Arrival
              </h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, maxWidth: '340px' }}>
                Share this 4-digit code with delivery hero Ramu Prasad after checking your plant.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#ffffff',
                color: '#064e3b',
                fontSize: '26px',
                fontWeight: 900,
                letterSpacing: '8px',
                padding: '8px 18px',
                borderRadius: '14px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {data.deliveryOtp || '8204'}
              </div>
              <button
                onClick={handleCopyOtp}
                style={{
                  background: copiedOtp ? '#22c55e' : 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copiedOtp ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* 3. 5-Stage Dynamic Order State Stepper */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.5px' }}>
              Order Lifecycle State Machine
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {stages.map((stage, idx) => {
                const isPassed = stageIdx > idx;
                const isCurrent = stageIdx === idx;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isPassed ? '#15803d' : isCurrent ? '#3b82f6' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none'
                    }}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13.5px', color: isCurrent ? '#1e3a8a' : isPassed ? '#0f172a' : '#94a3b8' }}>
                          {stage.title}
                        </strong>
                        {isCurrent && (
                          <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Delivery Hero & Nursery Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Rider Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img
                  src={data.rider?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt="Delivery Hero"
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
                />
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{data.rider?.name || 'Ramu Prasad'}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{data.rider?.vehicle || 'Hero Electric Scooter'} • {data.rider?.rating || '4.9'} ★</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`tel:${data.rider?.phone || '+919845011223'}`}
                  style={{
                    flex: 1,
                    background: '#ecfdf5',
                    color: '#065f46',
                    padding: '8px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  📞 Call Hero
                </a>
                <button
                  onClick={() => alert(`Special Instructions for Ramu: "${data.address} - Handle foliage with care."`)}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    color: '#334155',
                    padding: '8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  💬 Instructions
                </button>
              </div>
            </div>

            {/* Nursery Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  🏪
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                    {data.vendorName || 'PlantMe Certified Local Nursery'}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>● Botanist Certified Healthy Stock</span>
                </div>
              </div>

              <a
                href="tel:+918885600899"
                style={{
                  display: 'block',
                  background: '#f0fdf4',
                  color: '#15803d',
                  padding: '8px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: '1px solid #bbf7d0'
                }}
              >
                📞 Contact Nursery Store
              </a>
            </div>
          </div>

          {/* 5. 30-Day Guarantee & Unboxing Health Activation */}
          <div style={{
            background: '#fafafa',
            border: '1px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>30-Day Plant Thrive Guarantee</strong>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                  If foliage is damaged during transit, instant replacement with 1 tap.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setClaimSuccess(true);
                setTimeout(() => setClaimSuccess(false), 3000);
              }}
              style={{
                background: claimSuccess ? '#15803d' : '#1e293b',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {claimSuccess ? '✓ Certificate Active' : '📸 Snap Unboxing Photo'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

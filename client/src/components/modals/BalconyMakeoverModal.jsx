import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function BalconyMakeoverModal() {
  const { showBalconyModal, setShowBalconyModal, wallet, refreshWallet, currentUser } = useApp();

  const [selectedTier, setSelectedTier] = useState('balcony');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Suhas K.');
  const [customerPhone, setCustomerPhone] = useState('+91 88856 00899');
  const [address, setAddress] = useState(currentUser?.address || 'Flat 402, Green Heights, Indiranagar, Bengaluru');
  const [society, setSociety] = useState('Green Heights Apartment');
  const [plantCount, setPlantCount] = useState(10);
  const [preferredDate, setPreferredDate] = useState('Tomorrow');
  const [preferredSlot, setPreferredSlot] = useState('Morning (10:00 AM - 12:00 PM)');
  const [specialNotes, setSpecialNotes] = useState('Want to revive yellowing Monstera and set up balcony plants for better sunlight.');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedResult, setBookedResult] = useState(null);

  if (!showBalconyModal) return null;

  const tiers = [
    {
      id: 'triage',
      title: 'Plant Doctor At-Home Triage',
      badge: 'CLINICAL CARE',
      price: 499,
      duration: '45 Mins',
      icon: '🩺',
      features: [
        '10-plant thorough root & pest inspection',
        'Organic cold-pressed neem & antifungal spray',
        'Repotting of 2 pots (soil & perlite included)',
        'Personalized digital watering prescription'
      ]
    },
    {
      id: 'balcony',
      title: 'Balcony Garden Makeover',
      badge: 'MOST POPULAR',
      popular: true,
      price: 999,
      duration: '2 Hours',
      icon: '🌿',
      features: [
        'Full balcony layout & sunlight optimization',
        'Repotting of up to 6 plants into fresh potting mix',
        'Complete organic micronutrient boost & trimming',
        'Vertical railing planter styling & drainage audit'
      ]
    },
    {
      id: 'terrace',
      title: 'Terrace Jungle & Drip Setup',
      badge: 'COMPREHENSIVE',
      price: 2499,
      duration: '4 Hours',
      icon: '🌴',
      features: [
        'Complete micro-drip automated irrigation setup',
        '20kg premium vermicompost enriched soil treatment',
        'Plant pathology triage across all pots',
        'Free 60-day thriving guarantee + follow-up check'
      ]
    }
  ];

  const currentTierObj = tiers.find(t => t.id === selectedTier) || tiers[1];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      alert("Please enter your name, phone number, and home address.");
      return;
    }

    if (paymentMethod === 'wallet' && wallet < currentTierObj.price) {
      alert(`Insufficient wallet balance. Required: ₹${currentTierObj.price}, Balance: ₹${wallet}. Please choose 'Pay on Service' or add funds.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.bookBalconyMakeover({
        tier: selectedTier,
        tierTitle: currentTierObj.title,
        price: currentTierObj.price,
        customerName,
        customerEmail: currentUser?.email || 'customer@plantme.in',
        customerPhone,
        address,
        society,
        preferredDate,
        preferredSlot,
        plantCount,
        specialNotes,
        paymentMethod
      });

      if (res.success) {
        setBookedResult(res.booking);
        if (paymentMethod === 'wallet') {
          await refreshWallet();
        }
      } else {
        alert(res.message || "Failed to book service.");
      }
    } catch (err) {
      alert(err.message || "Failed to book service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBookedResult(null);
    setShowBalconyModal(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '24px 24px 0 0',
          position: 'relative'
        }}>
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
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
          
          <span style={{ background: '#d8f3dc', color: '#1b4332', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
            AT-HOME BOTANICAL CARE SERVICE
          </span>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: '8px 0 4px 0' }}>
            Balcony Makeover & Plant Doctor At-Home Visit
          </h2>
          <p style={{ fontSize: '13px', color: '#d8f3dc', margin: 0, opacity: 0.9 }}>
            Certified urban landscape botanists arrive with premium potting soil, organic neem pest shields & styling tools.
          </p>
        </div>

        {bookedResult ? (
          /* Booking Confirmation State */
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 16px' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', color: '#14532d', marginBottom: '8px' }}>
              Service Visit Confirmed!
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px' }}>
              Booking Reference: <strong>#{bookedResult.bookingId}</strong> • Confirmation & invoice dispatched to your email.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <img src={bookedResult.assignedBotanist.photo} alt={bookedResult.assignedBotanist.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', textTransform: 'uppercase' }}>ASSIGNED CERTIFIED BOTANIST</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{bookedResult.assignedBotanist.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{bookedResult.assignedBotanist.title} • ⭐ {bookedResult.assignedBotanist.rating}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '12.5px', color: '#334155' }}>
                <div><strong>Service:</strong> {bookedResult.tierTitle}</div>
                <div><strong>Scheduled Date:</strong> {bookedResult.preferredDate}</div>
                <div><strong>Time Window:</strong> {bookedResult.preferredSlot}</div>
                <div><strong>Total Paid:</strong> ₹{bookedResult.price} ({bookedResult.paymentMethod.toUpperCase()})</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Service Address:</strong> {bookedResult.address}</div>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                background: 'var(--primary-green)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Done & Return to Plants →
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleBooking} style={{ padding: '24px 28px' }}>
            
            {/* 1. Select Service Tier */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Select At-Home Service Package
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
                {tiers.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTier(t.id)}
                    style={{
                      border: selectedTier === t.id ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                      background: selectedTier === t.id ? '#f0fdf4' : '#ffffff',
                      borderRadius: '16px',
                      padding: '16px 14px',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t.popular && (
                      <span style={{ position: 'absolute', top: '-8px', right: '10px', background: 'var(--primary-green)', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
                        POPULAR
                      </span>
                    )}
                    <div>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{t.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Duration: {t.duration}</div>
                      
                      <ul style={{ paddingLeft: '14px', margin: '0 0 10px 0', fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                        {t.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-green)' }}>₹{t.price}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: selectedTier === t.id ? 'var(--primary-green)' : '#94a3b8' }}>
                        {selectedTier === t.id ? '● Selected' : 'Choose'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Schedule Date & Slot */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>PREFERRED VISIT DATE</label>
                <select
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Today (Express Evening)">Today (Express Evening 5-7 PM)</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Day after Tomorrow">Day after Tomorrow</option>
                  <option value="Upcoming Saturday">Upcoming Saturday (Weekend Slot)</option>
                  <option value="Upcoming Sunday">Upcoming Sunday (Weekend Slot)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>TIME WINDOW</label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Morning (9:00 AM - 11:00 AM)">Morning (9:00 AM - 11:00 AM)</option>
                  <option value="Afternoon (12:00 PM - 02:00 PM)">Afternoon (12:00 PM - 02:00 PM)</option>
                  <option value="Evening (04:00 PM - 06:00 PM)">Evening (04:00 PM - 06:00 PM)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>ESTIMATED NUMBER OF PLANTS</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={plantCount}
                  onChange={(e) => setPlantCount(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* 3. Address & Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>YOUR NAME</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>VISIT ADDRESS (DOOR NO., STREET & APARTMENT / TECH PARK)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 304, Tower B, Prestige Shantiniketan, Whitefield, Bengaluru"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>SPECIFIC PLANT ISSUES / GOALS (OPTIONAL)</label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Yellow leaves on Fiddle Leaf Fig, want vertical railing setup..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* 4. Payment Selection */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>PAYMENT METHOD</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <span>PlantMe Wallet (Bal: <strong>₹{Math.round(wallet)}</strong>)</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span>Pay on Service (Cash / UPI to Botanist)</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>TOTAL AMOUNT DUE</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-green)' }}>₹{currentTierObj.price}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '11px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? 'Confirming...' : `Confirm & Book Visit (₹${currentTierObj.price}) →`}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

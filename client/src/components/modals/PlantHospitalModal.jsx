import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function PlantHospitalModal() {
  const { showHospitalModal, setShowHospitalModal, wallet, refreshWallet, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState('vacation'); // 'vacation' or 'icu'
  const [plantCount, setPlantCount] = useState(5);
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [symptoms, setSymptoms] = useState('Yellowing bottom leaves, wet soggy soil, drooping stems');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Suhas K.');
  const [customerPhone, setCustomerPhone] = useState('+91 88856 00899');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'customer@plantme.in');
  const [address, setAddress] = useState(currentUser?.address || 'Flat 402, Green Heights, Indiranagar, Bengaluru');
  const [pickupDate, setPickupDate] = useState('Tomorrow');
  const [pickupSlot, setPickupSlot] = useState('Morning (9:00 AM - 12:00 PM)');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedResult, setBookedResult] = useState(null);

  if (!showHospitalModal) return null;

  // Price calculations
  const calculateTotal = () => {
    if (activeTab === 'vacation') {
      const bundles = Math.ceil(plantCount / 5);
      return bundles * 199 * durationWeeks;
    } else {
      // ICU Ward is ₹299 per dying plant
      return plantCount * 299;
    }
  };

  const grandTotal = calculateTotal();

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      alert("Please provide your name, phone number, and pickup address.");
      return;
    }

    if (paymentMethod === 'wallet' && wallet < grandTotal) {
      alert(`Insufficient wallet balance. Required: ₹${grandTotal}, Current Balance: ₹${wallet}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.bookPlantHospital({
        serviceType: activeTab === 'vacation' ? 'vacation_boarding' : 'icu_recovery',
        serviceTitle: activeTab === 'vacation' 
          ? `Vacation Greenhouse Boarding (${plantCount} plants, ${durationWeeks} weeks)` 
          : `Plant Hospital ICU Recovery Ward (${plantCount} plants)`,
        price: grandTotal,
        customerName,
        customerPhone,
        customerEmail,
        plantCount,
        durationWeeks: activeTab === 'vacation' ? durationWeeks : 2,
        symptoms: activeTab === 'icu' ? symptoms : '',
        address,
        pickupDate,
        pickupSlot,
        paymentMethod
      });

      if (res.success) {
        setBookedResult(res.record);
        if (paymentMethod === 'wallet') {
          await refreshWallet();
        }
      } else {
        alert(res.message || "Failed to schedule service.");
      }
    } catch (err) {
      alert(err.message || "Failed to schedule service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBookedResult(null);
    setShowHospitalModal(false);
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
          background: activeTab === 'vacation' 
            ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
            : 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
          transition: 'all 0.3s'
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
          
          <span style={{ background: '#ffffff', color: activeTab === 'vacation' ? '#0369a1' : '#991b1b', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
            {activeTab === 'vacation' ? 'TRAVEL GREEN NURSERY CARE' : 'SPECIALIZED CLINICAL REVIVAL'}
          </span>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: '8px 0 4px 0' }}>
            {activeTab === 'vacation' ? 'Vacation Plant Boarding & Hotel' : 'Plant Hospital ICU Recovery Ward'}
          </h2>
          <p style={{ fontSize: '13px', color: '#f1f5f9', margin: 0, opacity: 0.9 }}>
            {activeTab === 'vacation'
              ? 'Going out of town? Keep your green babies thriving in our climate-controlled nursery with daily WhatsApp photo logs.'
              : 'Dying plant? Severe root rot or pest shock? 14-day clinical nursery recovery with 100% revive-or-replace guarantee.'}
          </p>
        </div>

        {bookedResult ? (
          /* Confirmation View */
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 16px' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', color: '#14532d', marginBottom: '8px' }}>
              {bookedResult.serviceType === 'vacation_boarding' ? 'Vacation Boarding Reserved!' : 'ICU Bed Reserved!'}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px' }}>
              Admission Ticket: <strong>#{bookedResult.hospitalId}</strong> • Status: <strong>{bookedResult.wardStatus}</strong>
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '12.5px', color: '#334155' }}>
                <div><strong>Service:</strong> {bookedResult.serviceTitle}</div>
                <div><strong>Pickup Date:</strong> {bookedResult.pickupDate}</div>
                <div><strong>Pickup Window:</strong> {bookedResult.pickupSlot}</div>
                <div><strong>Total Paid:</strong> ₹{bookedResult.price} ({bookedResult.paymentMethod.toUpperCase()})</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Doorstep Address:</strong> {bookedResult.address}</div>
                <div style={{ gridColumn: '1 / -1', color: '#0369a1', fontWeight: 700 }}>
                  PlantMe shock-free EV cargo rider will bring hydration crates to collect your plants.
                </div>
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
          /* Form View */
          <form onSubmit={handleBooking} style={{ padding: '24px 28px' }}>
            
            {/* Top Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('vacation'); setPlantCount(5); }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: activeTab === 'vacation' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeTab === 'vacation' ? '#f0f9ff' : '#ffffff',
                  color: activeTab === 'vacation' ? '#0369a1' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Vacation Nursery Boarding (₹199/wk)
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('icu'); setPlantCount(1); }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: activeTab === 'icu' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  background: activeTab === 'icu' ? '#fef2f2' : '#ffffff',
                  color: activeTab === 'icu' ? '#991b1b' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Plant Hospital ICU Recovery (₹299/plant)
              </button>
            </div>

            {/* Feature Callouts */}
            <div style={{
              background: activeTab === 'vacation' ? '#f0f9ff' : '#fef2f2',
              border: activeTab === 'vacation' ? '1px solid #bae6fd' : '1px solid #fecaca',
              padding: '14px 16px',
              borderRadius: '14px',
              marginBottom: '20px',
              fontSize: '12px',
              color: activeTab === 'vacation' ? '#0369a1' : '#991b1b'
            }}>
              {activeTab === 'vacation' ? (
                <div>
                  <strong>What's Included in Vacation Boarding:</strong>
                  <div style={{ marginTop: '4px', lineHeight: 1.5 }}>
                    • Sensor-controlled automated watering & climate humidity misting<br/>
                    • Full-spectrum LED grow light cycles matching plant species<br/>
                    • Weekly WhatsApp photo updates with botanist health notes<br/>
                    • EV Doorstep pickup & return delivery in upright shock-free crates
                  </div>
                </div>
              ) : (
                <div>
                  <strong>What's Included in Plant Hospital ICU:</strong>
                  <div style={{ marginTop: '4px', lineHeight: 1.5 }}>
                    • Clinical root rot debridement & anti-fungal botanical bath<br/>
                    • Repotting into sterile bio-char enriched aerated rooting substrate<br/>
                    • 14-day humidity recovery dome isolation ward<br/>
                    • 100% "Revived or Nursery Fresh Replacement" Guarantee
                  </div>
                </div>
              )}
            </div>

            {/* Service Specific Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {activeTab === 'vacation' ? 'NUMBER OF PLANTS' : 'NUMBER OF DYING PLANTS'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={plantCount}
                  onChange={(e) => setPlantCount(Number(e.target.value) || 1)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  {activeTab === 'vacation' ? '₹199 per 5 plants / week' : '₹299 per admitted plant'}
                </span>
              </div>

              {activeTab === 'vacation' && (
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    BOARDING DURATION (WEEKS)
                  </label>
                  <select
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value={1}>1 Week (7 Days)</option>
                    <option value={2}>2 Weeks (14 Days)</option>
                    <option value={3}>3 Weeks (21 Days)</option>
                    <option value={4}>4 Weeks (1 Month)</option>
                  </select>
                </div>
              )}

              {activeTab === 'icu' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    SYMPTOMS & ISSUES
                  </label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Yellow leaves, wet soggy roots, white powdery fungus..."
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>

            {/* Pickup Scheduling & Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>PICKUP DATE</label>
                <select
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Today (Express Evening)">Today (Express 5-7 PM)</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Day after Tomorrow">Day after Tomorrow</option>
                  <option value="This Weekend">This Weekend</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>TIME WINDOW</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                  <option value="Evening (5:00 PM - 7:30 PM)">Evening (5:00 PM - 7:30 PM)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>DOORSTEP PICKUP ADDRESS</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Green Heights, Indiranagar, Bengaluru"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>PAYMENT METHOD</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="hospPayment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <span>PlantMe Wallet (Bal: <strong>₹{Math.round(wallet)}</strong>)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="hospPayment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span>Pay on Doorstep Pickup (Cash / UPI)</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>TOTAL SERVICE AMOUNT</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: activeTab === 'vacation' ? '#0284c7' : '#dc2626' }}>
                  ₹{grandTotal.toLocaleString()}
                </span>
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
                    background: activeTab === 'vacation' ? '#0284c7' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Scheduling...' : `Confirm & Schedule Pickup (₹${grandTotal.toLocaleString()}) →`}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

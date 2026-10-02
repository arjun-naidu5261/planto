import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function SubscriptionClubModal() {
  const { showClubModal, setShowClubModal, wallet, refreshWallet, currentUser } = useApp();

  const [selectedTier, setSelectedTier] = useState('green_explorer');
  const [cadence, setCadence] = useState('monthly'); // 'monthly', 'quarterly', 'half_yearly'
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Suhas K.');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'customer@plantme.in');
  const [customerPhone, setCustomerPhone] = useState('+91 88856 00899');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'Flat 402, Green Heights, Indiranagar, Bengaluru');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subResult, setSubResult] = useState(null);

  if (!showClubModal) return null;

  const baseMonthlyPrice = selectedTier === 'collectors_bloom' ? 699 : 349;
  
  // Calculate discount based on cadence
  let totalMonths = 1;
  let discountRate = 0;
  let bonusGift = '';

  if (cadence === 'quarterly') {
    totalMonths = 3;
    discountRate = 0.10;
    bonusGift = '🎁 FREE Vintage Brass Plant Misting Spray included in Box 1!';
  } else if (cadence === 'half_yearly') {
    totalMonths = 6;
    discountRate = 0.20;
    bonusGift = '🎁 FREE Digital Soil Moisture & Sunlight Sensor included in Box 1!';
  }

  const rawTotal = baseMonthlyPrice * totalMonths;
  const discountedTotal = Math.round(rawTotal * (1 - discountRate));

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!customerName || !deliveryAddress) {
      alert("Please provide your delivery name and address.");
      return;
    }

    if (paymentMethod === 'wallet' && wallet < discountedTotal) {
      alert(`Insufficient wallet balance. Required: ₹${discountedTotal}, Current Balance: ₹${wallet}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.joinMysteryClub({
        tier: selectedTier,
        planName: selectedTier === 'collectors_bloom' ? "Rare & Collector's Bloom Club" : "The Green Explorer Club",
        cadence,
        price: discountedTotal,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        paymentMethod
      });

      if (res.success) {
        setSubResult(res.subscription);
        if (paymentMethod === 'wallet') {
          await refreshWallet();
        }
      } else {
        alert(res.message || "Failed to start subscription.");
      }
    } catch (err) {
      alert(err.message || "Failed to start subscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubResult(null);
    setShowClubModal(false);
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
          background: 'linear-gradient(135deg, #14532d 0%, #064e3b 100%)',
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
          
          <span style={{ background: '#bbf7d0', color: '#14532d', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
            MONTHLY GREEN DISCOVERY
          </span>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: '8px 0 4px 0' }}>
            "Plant of the Month" Mystery Box Club
          </h2>
          <p style={{ fontSize: '13px', color: '#dcfce7', margin: 0, opacity: 0.9 }}>
            Unbox an exotic live plant + handcrafted ceramic pot + collector care passport every month at 40% below retail prices.
          </p>
        </div>

        {subResult ? (
          /* Active Subscription State */
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 16px' }}>
              🎁
            </div>
            <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', color: '#14532d', marginBottom: '8px' }}>
              Welcome to the Mystery Club!
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px' }}>
              Subscription ID: <strong>#{subResult.subscriptionId}</strong> • Membership Card saved to your profile!
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                {subResult.planName} ({subResult.cadence.toUpperCase()})
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>📦 <strong>Next Mystery Box Dispatch:</strong> {subResult.nextMysteryBoxDispatch} via EV Cargo</div>
                <div>📍 <strong>Shipping Address:</strong> {subResult.deliveryAddress}</div>
                <div>⭐ <strong>VIP Perks Active:</strong> Storewide 10% discount, free botanist video credits, replacement guarantee</div>
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
              Start Exploring Plants →
            </button>
          </div>
        ) : (
          /* Subscription Form */
          <form onSubmit={handleSubscribe} style={{ padding: '24px 28px' }}>
            
            {/* 1. Choose Club Tier */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Select Subscription Tier
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {/* Green Explorer */}
                <div
                  onClick={() => setSelectedTier('green_explorer')}
                  style={{
                    border: selectedTier === 'green_explorer' ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                    background: selectedTier === 'green_explorer' ? '#f0fdf4' : '#ffffff',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>🌱</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>The Green Explorer Club</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '10px' }}>Perfect for apartment greenery & beginner botanists</div>
                  
                  <ul style={{ paddingLeft: '14px', margin: '0 0 12px 0', fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                    <li>1 Exotic live potted plant (Air purifier/foliage)</li>
                    <li>Matte ceramic planter + drainage saucer</li>
                    <li>Collector Passport stamp & care instructions</li>
                    <li>Free pouch of organic soil food</li>
                  </ul>

                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-green)' }}>
                    ₹349 <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>/ month</span>
                  </div>
                </div>

                {/* Collector's Bloom */}
                <div
                  onClick={() => setSelectedTier('collectors_bloom')}
                  style={{
                    border: selectedTier === 'collectors_bloom' ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                    background: selectedTier === 'collectors_bloom' ? '#f0fdf4' : '#ffffff',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <span style={{ position: 'absolute', top: '-8px', right: '10px', background: '#b45309', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
                    COLLECTOR'S CHOICE
                  </span>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>🌸</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>Rare & Collector's Bloom Club</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '10px' }}>Rare variegated cultivars, bonsai & exotic blooms</div>

                  <ul style={{ paddingLeft: '14px', margin: '0 0 12px 0', fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                    <li>1 Rare exotic cultivar (Pink Princess / Bonsai)</li>
                    <li>Luxury self-watering sub-irrigation planter</li>
                    <li>Signed botanist certificate & art print</li>
                    <li>1 Free 1-on-1 Video Botanist call every month</li>
                  </ul>

                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-green)' }}>
                    ₹699 <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>/ month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Billing Cadence */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2. Select Billing Cadence & Discount
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {[
                  { id: 'monthly', title: 'Monthly Plan', sub: 'Pay as you go • Cancel anytime', disc: 'Standard' },
                  { id: 'quarterly', title: '3-Month Plan', sub: '10% OFF + Brass mister gift', disc: '10% OFF' },
                  { id: 'half_yearly', title: '6-Month Plan', sub: '20% OFF + Digital soil sensor', disc: '20% OFF' }
                ].map(c => (
                  <div
                    key={c.id}
                    onClick={() => setCadence(c.id)}
                    style={{
                      border: cadence === c.id ? '2px solid var(--primary-green)' : '1px solid #cbd5e1',
                      background: cadence === c.id ? '#f0fdf4' : '#ffffff',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{c.title}</div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary-green)', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>{c.disc}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.sub}</div>
                  </div>
                ))}
              </div>

              {bonusGift && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', fontWeight: 700, padding: '8px 12px', borderRadius: '10px', marginTop: '10px' }}>
                  {bonusGift}
                </div>
              )}
            </div>

            {/* 3. Delivery Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>RECIPIENT NAME</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>PHONE (FOR RIDER CALL)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>DOORSTEP DELIVERY ADDRESS</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Green Heights, Indiranagar, Bengaluru"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>PAYMENT METHOD</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="clubPayment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                  />
                  <span>PlantMe Wallet (Bal: <strong>₹{Math.round(wallet)}</strong>)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="clubPayment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <span>UPI / Cards / NetBanking</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>TOTAL AMOUNT DUE</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-green)' }}>
                  ₹{discountedTotal.toLocaleString()}
                  {discountRate > 0 && (
                    <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#94a3b8', marginLeft: '6px' }}>₹{rawTotal}</span>
                  )}
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
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Starting Club...' : `Join Club & Pay ₹${discountedTotal.toLocaleString()} →`}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

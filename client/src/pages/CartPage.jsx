import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    checkout,
    wallet,
    loadAllData,
    openCertificate,
    hasCarePass,
    setHasCarePass
  } = useApp();

  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState('PlantMe Express Delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryInstruction, setDeliveryInstruction] = useState('Eco-friendly hydration wrap requested');
  const [showLiveTracker, setShowLiveTracker] = useState(false);
  const [trackerStage, setTrackerStage] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [addCarePass, setAddCarePass] = useState(false);

  // Personalized Eco-Gifting States
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [engravedTag, setEngravedTag] = useState('');
  const [voiceGreetingType, setVoiceGreetingType] = useState('recorded'); // 'recorded' or 'text'
  const [voiceGreetingText, setVoiceGreetingText] = useState('Happy birthday! May this green plant bring happiness & fresh oxygen to your home.');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);

  // Delivery costs
  const getDeliveryCharge = () => {
    if (deliveryType === 'PlantMe Express Delivery' || deliveryType === 'Express Nursery Delivery') return 30;
    if (deliveryType === 'Standard Courier') return 15;
    return 0; // Reserve & Collect
  };

  const deliveryCharge = getDeliveryCharge();
  const giftCharge = isGift ? 49 : 0;
  const carePassCharge = (addCarePass && !hasCarePass) ? 99 : 0;
  
  // Calculate pricing
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const grandTotal = Math.max(0, subtotal + deliveryCharge + giftCharge + carePassCharge - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'PLANTME50' || code === 'PLANTO50') {
      setDiscountPercent(50);
      setCouponMessage('🎉 Coupon PLANTME50 applied: 50% off products!');
    } else if (code === 'FIRSTPLANT') {
      setDiscountPercent(20);
      setCouponMessage('🎉 Coupon FIRSTPLANT applied: 20% off!');
    } else {
      setDiscountPercent(0);
      setCouponMessage('❌ Invalid coupon code. Try PLANTME50 or FIRSTPLANT');
    }
  };

  const handleCheckout = async () => {
    if (wallet < grandTotal) {
      alert(`Insufficient wallet balance. Grand total is ₹${grandTotal}, your wallet balance is ₹${wallet}.`);
      return;
    }

    const firstVendor = 'PlantMe Express Fulfillment Hub';
    
    if (isGift) {
      try {
        await api.saveEcoGifting({
          recipientName: giftRecipient || 'Beloved Recipient',
          engravedTagText: engravedTag || 'Growing with Love 🌿',
          giftBagType: 'Festive Organic Jute Bag + Biodegradable Raffia',
          audioGreetingText: voiceGreetingText,
          hasAudio: hasRecordedAudio
        });
      } catch (e) {}
    }

    const res = await checkout(deliveryType, grandTotal, firstVendor);
    if (res.success) {
      if (addCarePass) {
        setHasCarePass(true);
      }
      setPlacedOrder(res.order);
      setShowLiveTracker(true);
      // Simulate live order tracking progress
      setTimeout(() => setTrackerStage(2), 2500);
      setTimeout(() => setTrackerStage(3), 5500);
      setTimeout(() => setTrackerStage(4), 8500);
      await loadAllData();
    } else {
      alert(res.message || "Failed to complete checkout.");
    }
  };

  if (cart.length === 0 && !showLiveTracker) {
    return (
      <div id="view-cart" className="page-view active" style={{ display: 'block', paddingBottom: '60px', minHeight: 'calc(100vh - 120px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
          <div className="section-title-row" style={{ marginBottom: '24px' }}>
            <div>
              <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', color: '#1b4332', fontSize: '28px' }}>My Gardening Cart</h2>
              <p className="section-subtitle" style={{ color: '#64748b' }}>Review items, set delivery options, and complete checkout using your wallet balance.</p>
            </div>
          </div>

          <div id="cart-empty-state" style={{ textAlign: 'center', padding: '70px 24px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9', color: '#1b4332', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '38px' }}>
              🛒
            </div>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: '#1b4332', margin: '0 0 10px 0' }}>Your Gardening Cart is Empty</h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Explore our premium live plants, organic pots, and botanical care essentials for 20 to 30 minute express delivery!
            </p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1b4332', color: '#ffffff', padding: '14px 28px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}>
              Explore Plant Collection →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="view-cart" className="page-view active" style={{ display: 'block', paddingBottom: '60px' }}>
      
      {/* Live Swiggy/Zomato Order Tracker Modal */}
      {showLiveTracker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '32px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
            
            <div style={{ background: '#e8f5e9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '20px', fontWeight: 800, color: '#1b4332' }}>
              PlantMe
            </div>

            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: '#1b4332', marginBottom: '6px' }}>
              Order Confirmed & Preparing!
            </h3>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>
              Estimated Delivery: <strong>20-30 Mins</strong> • PlantMe Express Fulfillment Hub
            </p>

            {/* Live Plant Transit Guarantee Badge */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', color: '#166534', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>Eco-Moss Root Wrap Intact</span>
              <span>•</span>
              <span>Upright EV Transit</span>
              <span>•</span>
              <span>30-Day Guarantee</span>
            </div>

            {/* Progress Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 1 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 1 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>✓</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>1. Quality Inspection at PlantMe Hub</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Foliage health and soil moisture verified by botanist</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 2 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 2 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{trackerStage >= 2 ? '✓' : '2'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>2. Eco-Moss Hydration Packaging</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Roots enveloped in damp moisture-shield wrap for upright transit</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 3 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 3 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{trackerStage >= 3 ? '✓' : '3'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>3. Out for Express Delivery</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>PlantMe EV rider picked up your live cargo in shock-free box</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 4 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 4 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{trackerStage >= 4 ? '✓' : '4'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>4. Delivered to Doorstep</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Handed over with official PlantMe care card</div>
                </div>
              </div>
            </div>

            {/* Instant Digital Certificate & WhatsApp Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <button 
                onClick={() => openCertificate(placedOrder?.id || 'ORD-7290')}
                style={{
                  flex: 1,
                  background: '#fff3e0',
                  color: '#e65100',
                  border: '1.5px solid #ffe0b2',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Birth Certificate
              </button>

              <button 
                onClick={async () => {
                  try {
                    await fetch('http://localhost:5002/api/notifications/whatsapp-care-card', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: '+91 98856 00899', plantName: placedOrder?.items?.[0]?.name || 'Plant' })
                    });
                    alert("WhatsApp Care Card & Unboxing instructions sent to your phone!");
                  } catch (e) {
                    alert("Sent WhatsApp notification!");
                  }
                }}
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                WhatsApp Care
              </button>
            </div>

            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'center', height: '48px', borderRadius: '12px' }}
              onClick={() => {
                setShowLiveTracker(false);
                navigate('/profile');
              }}
            >
              View Order History in Profile →
            </button>
          </div>
        </div>
      )}

      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '28px' }}>Checkout PlantMe Cart</h2>
          <p className="section-subtitle">Review items, set express delivery options, and complete checkout using your wallet balance.</p>
        </div>
      </div>

      <div className="stall-grid-sections" id="cart-content-wrapper">
        {/* Cart items list */}
        <div className="stall-hours-box" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }} id="cart-items-box">
          
          <div style={{ background: '#f4fbf7', border: '1px solid #c8e6c9', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🌿</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-green)', textTransform: 'uppercase' }}>FULFILLED BY</div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#1b4332' }}>PlantMe Express Fulfillment Hub (Bengaluru)</div>
            </div>
          </div>

          <div id="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {cart.map((item) => (
              <div 
                key={item.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={item.images[0]} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px' }} alt={item.name} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>{item.name}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--primary-green)', fontWeight: 700, marginTop: '2px', display: 'inline-block' }}>₹{item.price} each</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '20px', overflow: 'hidden', background: '#fafafa' }}>
                    <button 
                      className="cart-qty-btn" 
                      onClick={() => updateCartQty(item.id, item.quantity - 1)}
                      style={{ border: 'none', background: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 8px', fontSize: '14px', fontWeight: 800 }}>{item.quantity}</span>
                    <button 
                      className="cart-qty-btn" 
                      onClick={() => updateCartQty(item.id, item.quantity + 1)}
                      style={{ border: 'none', background: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px' }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="cart-remove-btn" 
                    onClick={() => removeFromCart(item.id)}
                    style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown and checkout details */}
        <div className="stall-hours-box" style={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontWeight: 800 }}>Delivery & Payment</h3>
          
          <div className="form-group">
            <label htmlFor="cart-delivery-type" style={{ fontWeight: 700 }}>Choose Delivery Mode</label>
            <select 
              id="cart-delivery-type" 
              value={deliveryType} 
              onChange={(e) => setDeliveryType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', fontWeight: 600, fontSize: '13px' }}
            >
              <option value="PlantMe Express Delivery">PlantMe Express Delivery (20-30 Mins) - ₹30</option>
              <option value="Reserve & Collect">PlantMe Micro-Hub Pickup - Free</option>
              <option value="Standard Courier">Standard Eco-Shipping (1-2 Days) - ₹15</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 700 }}>Delivery Instruction</label>
            <input 
              type="text" 
              value={deliveryInstruction} 
              onChange={(e) => setDeliveryInstruction(e.target.value)} 
              placeholder="e.g. Leave with security, Add eco hydration wrap..." 
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '13px' }} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="cart-coupon-input" style={{ fontWeight: 700 }}>Promo Code</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                id="cart-coupon-input" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                placeholder="PLANTME50" 
                style={{ borderRadius: '10px', border: '1px solid #ccc', padding: '8px 12px' }} 
              />
              <button className="btn" id="cart-apply-coupon" onClick={handleApplyCoupon} style={{ padding: '0 16px', borderRadius: '10px', fontWeight: 800 }}>Apply</button>
            </div>
            {couponMessage && (
              <div id="coupon-msg" style={{ fontSize: '11px', marginTop: '6px', fontWeight: 700, color: discountPercent > 0 ? 'var(--primary-green)' : '#d32f2f' }}>
                {couponMessage}
              </div>
            )}
          </div>

          {/* Personalized Eco-Gifting Flow */}
          <div style={{
            background: isGift ? '#fbf7ee' : '#fafafa',
            border: isGift ? '1.5px solid #d4a373' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={isGift} 
                  onChange={(e) => setIsGift(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#582f0e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎁</span> Send as Personalized Eco-Gift (+ ₹49)
                  </div>
                  <div style={{ fontSize: '11px', color: '#7f5539' }}>Festive Jute Wrap • Engraved Wooden Tag • 15s Voice Note</div>
                </div>
              </label>
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#faedcd', color: '#603808', padding: '3px 8px', borderRadius: '8px' }}>
                Eco-Friendly
              </span>
            </div>

            {isGift && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #ebd9c8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#582f0e', display: 'block', marginBottom: '4px' }}>RECIPIENT NAME</label>
                  <input 
                    type="text" 
                    value={giftRecipient} 
                    onChange={(e) => setGiftRecipient(e.target.value)} 
                    placeholder="e.g. Sneha Reddy" 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccd5ae', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#582f0e', display: 'block', marginBottom: '4px' }}>ENGRAVED WOODEN PLANT TAG TEXT</label>
                  <input 
                    type="text" 
                    value={engravedTag} 
                    onChange={(e) => setEngravedTag(e.target.value)} 
                    placeholder="e.g. Happy Housewarming Sneha! 🌿 From Arjun" 
                    maxLength={50}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccd5ae', fontSize: '12.5px' }}
                  />
                  <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Max 50 chars • Laser-etched onto sustainable birchwood</div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#582f0e', display: 'block', marginBottom: '6px' }}>15-SECOND VOICE GREETING (AUDIO NOTE)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecording(true);
                        setTimeout(() => {
                          setIsRecording(false);
                          setHasRecordedAudio(true);
                        }, 2500);
                      }}
                      style={{
                        background: hasRecordedAudio ? '#2e7d32' : isRecording ? '#dc2626' : '#ffffff',
                        color: hasRecordedAudio || isRecording ? '#ffffff' : '#582f0e',
                        border: '1.5px solid #d4a373',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{isRecording ? 'Recording...' : hasRecordedAudio ? '✓ Audio Attached' : 'Record 15s Greeting'}</span>
                    </button>
                    {hasRecordedAudio && (
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                        ▶ Ready! Plays when recipient scans tag QR
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: '#e9edc9', padding: '10px', borderRadius: '10px', fontSize: '11.5px', color: '#333d29', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🌱</span>
                  <span><strong>Green Impact:</strong> +1 native sapling planted in recipient's name via SankalpTaru foundation.</span>
                </div>
              </div>
            )}
          </div>

          {/* PlantMe Care Pass Subscription Option */}
          <div style={{
            background: hasCarePass || addCarePass ? '#f0fdf4' : '#fafafa',
            border: hasCarePass || addCarePass ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: hasCarePass ? 'default' : 'pointer', margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={hasCarePass || addCarePass} 
                  disabled={hasCarePass}
                  onChange={(e) => setAddCarePass(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: hasCarePass ? 'default' : 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#14532d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🛡️</span> {hasCarePass ? 'PlantMe Care Pass (Active VIP Member)' : 'Add PlantMe Care Pass (+ ₹99/mo)'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Unlimited 1-Click replacements • Free quarterly vermicompost • 2 free live botanist calls/mo
                  </div>
                </div>
              </label>
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '8px' }}>
                {hasCarePass ? 'Active' : 'VIP Perk'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px', background: '#f8f9fa', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal</span>
              <span id="cart-subtotal" style={{ fontWeight: 700 }}>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Fee</span>
              <span id="cart-delivery-charge" style={{ fontWeight: 700 }}>₹{deliveryCharge}</span>
            </div>
            {isGift && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7f5539', fontWeight: 700 }}>
                <span>Eco-Gift Wrap & Wooden Tag</span>
                <span>+₹49</span>
              </div>
            )}
            {carePassCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 700 }}>
                <span>PlantMe Care Pass (1 Mo)</span>
                <span>+₹99</span>
              </div>
            )}
            {discountPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d32f2f', fontWeight: 700 }} id="cart-discount-row">
                <span>Coupon Discount ({discountPercent}%)</span>
                <span id="cart-discount">-₹{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', borderTop: '1px dashed #ccc', paddingTop: '10px', marginTop: '4px', color: 'var(--primary-green)' }}>
              <span>Grand Total</span>
              <span id="cart-grand-total">₹{grandTotal}</span>
            </div>
          </div>

          {/* Plant-Safe Packaging Promise & Guarantee */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#166534' }}>
            <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              PlantMe Customer Protection Guarantee
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: '#15803d' }}>
              <div>✓ Moisture-preserving root hydration wrap included free</div>
              <div>✓ Upright shock-free EV cargo handling</div>
              <div>✓ Free 30-Day Plant Thrive or Replacement Guarantee</div>
              <div>✓ Digital Adoption Certificate & WhatsApp watering alerts</div>
            </div>
          </div>

          <button className="btn" id="cart-checkout-submit" onClick={handleCheckout} style={{ width: '100%', justifyContent: 'center', height: '48px', borderRadius: '12px', fontSize: '15px', fontWeight: 800 }}>
            Pay ₹{grandTotal} from Wallet (Bal: ₹{Math.round(wallet)}) →
          </button>
        </div>
      </div>
    </div>
  );
}


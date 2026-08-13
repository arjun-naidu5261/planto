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
    loadAllData
  } = useApp();

  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState('Express Nursery Delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryInstruction, setDeliveryInstruction] = useState('Eco-friendly hydration wrap requested');
  const [showLiveTracker, setShowLiveTracker] = useState(false);
  const [trackerStage, setTrackerStage] = useState(1);

  // Delivery costs
  const getDeliveryCharge = () => {
    if (deliveryType === 'Express Nursery Delivery') return 30;
    if (deliveryType === 'Standard Courier') return 15;
    return 0; // Reserve & Collect
  };

  const deliveryCharge = getDeliveryCharge();
  
  // Calculate pricing
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const grandTotal = Math.max(0, subtotal + deliveryCharge - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'PLANTO50') {
      setDiscountPercent(50);
      setCouponMessage('🎉 Coupon PLANTO50 applied: 50% off products!');
    } else if (couponCode.toUpperCase() === 'FIRSTPLANT') {
      setDiscountPercent(20);
      setCouponMessage('🎉 Coupon FIRSTPLANT applied: 20% off!');
    } else {
      setDiscountPercent(0);
      setCouponMessage('❌ Invalid coupon code. Try PLANTO50 or FIRSTPLANT');
    }
  };

  const handleCheckout = async () => {
    if (wallet < grandTotal) {
      alert(`Insufficient wallet balance. Grand total is ₹${grandTotal}, your wallet balance is ₹${wallet}.`);
      return;
    }

    const firstVendor = cart[0]?.vendorName || 'Sai Baba Plant & Pot Stall';
    
    const res = await checkout(deliveryType, grandTotal, firstVendor);
    if (res.success) {
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
      <div id="view-cart" className="page-view active" style={{ display: 'block', paddingBottom: '60px' }}>
        <div className="section-title-row" style={{ marginBottom: '30px' }}>
          <div>
            <h2 className="section-title">My Gardening Cart</h2>
            <p className="section-subtitle">Review items, set delivery options, and complete checkout using your wallet balance.</p>
          </div>
        </div>
        <div id="cart-empty-state" style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <svg width="64" height="64" style={{ color: '#ccc', marginBottom: '16px' }}><use href="#icon-cart"></use></svg>
          <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Your cart is empty</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>Explore nearby nurseries or browse our plant & pot catalog to add items.</p>
          <Link to="/" className="btn" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 28px', borderRadius: '12px' }}>Explore Nearby Nurseries</Link>
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
            
            <div style={{ background: '#e8f5e9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '32px' }}>
              🪴
            </div>

            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: '#1b4332', marginBottom: '6px' }}>
              Order Confirmed & Preparing!
            </h3>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>
              Estimated Delivery: <strong>30-40 Mins</strong> • Local Nursery Express
            </p>

            {/* Progress Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 1 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 1 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>✓</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>1. Order Placed at Nursery</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Order sent directly to local nursery counter</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 2 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 2 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{trackerStage >= 2 ? '✓' : '2'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>2. Hydration Packaging</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Nursery staff wrapping root ball in moisture eco-pack</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 3 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 3 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{trackerStage >= 3 ? '✓' : '3'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>3. Out for Express Delivery 🛵</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Ramu (Planto Rider) picked up your plant order</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: trackerStage >= 4 ? 1 : 0.4 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackerStage >= 4 ? '#2e7d32' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>{trackerStage >= 4 ? '✓' : '4'}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>4. Delivered to Doorstep</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Handed over with plant care guide</div>
                </div>
              </div>
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
          <h2 className="section-title" style={{ fontSize: '28px' }}>Checkout Nursery Cart</h2>
          <p className="section-subtitle">Review items, set delivery options, and complete checkout using your wallet balance.</p>
        </div>
      </div>

      <div className="stall-grid-sections" id="cart-content-wrapper">
        {/* Cart items list */}
        <div className="stall-hours-box" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }} id="cart-items-box">
          
          <div style={{ background: '#f4fbf7', border: '1px solid #c8e6c9', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🏪</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-green)' }}>FULFILLMENT NURSERY</div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{cart[0]?.vendorName || 'Sai Baba Plant & Pot Stall'}</div>
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
              <option value="Express Nursery Delivery">⚡ Express Nursery Delivery (30-45 Mins) - ₹30</option>
              <option value="Reserve & Collect">🏪 Reserve & Pickup at Nursery Counter - Free</option>
              <option value="Standard Courier">📦 Standard Shipping (1-2 Days) - ₹15</option>
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
                placeholder="PLANTO50" 
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px', background: '#f8f9fa', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal</span>
              <span id="cart-subtotal" style={{ fontWeight: 700 }}>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Fee</span>
              <span id="cart-delivery-charge" style={{ fontWeight: 700 }}>₹{deliveryCharge}</span>
            </div>
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

          <button className="btn" id="cart-checkout-submit" onClick={handleCheckout} style={{ width: '100%', justifyContent: 'center', height: '48px', borderRadius: '12px', fontSize: '15px', fontWeight: 800 }}>
            Pay ₹{grandTotal} from Wallet (Bal: ₹{Math.round(wallet)}) →
          </button>
        </div>
      </div>
    </div>
  );
}


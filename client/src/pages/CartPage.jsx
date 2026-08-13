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
  const [deliveryType, setDeliveryType] = useState('Standard Door Delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Delivery costs
  const getDeliveryCharge = () => {
    if (deliveryType === 'Same Day Delivery') return 40;
    if (deliveryType === 'Standard Door Delivery') return 20;
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
    } else {
      setDiscountPercent(0);
      setCouponMessage('❌ Invalid coupon code. Try PLANTO50');
    }
  };

  const handleCheckout = async () => {
    if (wallet < grandTotal) {
      alert(`Insufficient wallet balance. Grand total is ₹${grandTotal}, your balance is ₹${wallet}.`);
      return;
    }

    const firstVendor = cart[0]?.vendorName || 'Sai Baba Plant & Pot Stall';
    
    const res = await checkout(deliveryType, grandTotal, firstVendor);
    if (res.success) {
      alert("🎉 Order placed successfully! Deducted wallet amount. Track status in your Profile.");
      navigate('/profile');
      await loadAllData(); // refresh order/wallet lists
    } else {
      alert(res.message || "Failed to complete checkout.");
    }
  };

  if (cart.length === 0) {
    return (
      <div id="view-cart" className="page-view active" style={{ display: 'block' }}>
        <div className="section-title-row" style={{ marginBottom: '30px' }}>
          <div>
            <h2 className="section-title">My Gardening Cart</h2>
            <p className="section-subtitle">Review items, set delivery options, and complete checkout using your wallet balance.</p>
          </div>
        </div>
        <div id="cart-empty-state" style={{ textAlign: 'center', padding: '80px 0' }}>
          <svg width="60" height="60" style={{ color: '#ccc', marginBottom: '20px' }}><use href="#icon-cart"></use></svg>
          <h3>Your cart is empty</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>Explore our plants database or view physical roadside stalls map to add items.</p>
          <Link to="/" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Explore Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div id="view-cart" className="page-view active" style={{ display: 'block' }}>
      <div className="section-title-row" style={{ marginBottom: '30px' }}>
        <div>
          <h2 className="section-title">My Gardening Cart</h2>
          <p className="section-subtitle">Review items, set delivery options, and complete checkout using your wallet balance.</p>
        </div>
      </div>

      <div className="stall-grid-sections" id="cart-content-wrapper">
        {/* Cart items list */}
        <div className="stall-hours-box" style={{ padding: '30px' }} id="cart-items-box">
          <div id="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map((item) => (
              <div 
                key={item.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={item.images[0]} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} alt={item.name} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{item.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: 600 }}>₹{item.price} each</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <button 
                      className="cart-qty-btn" 
                      onClick={() => updateCartQty(item.id, item.quantity - 1)}
                      style={{ border: 'none', background: 'none', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 700 }}>{item.quantity}</span>
                    <button 
                      className="cart-qty-btn" 
                      onClick={() => updateCartQty(item.id, item.quantity + 1)}
                      style={{ border: 'none', background: 'none', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="cart-remove-btn" 
                    onClick={() => removeFromCart(item.id)}
                    style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown and checkout details */}
        <div className="stall-hours-box">
          <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Order Details</h3>
          
          <div className="form-group">
            <label htmlFor="cart-delivery-type">Delivery Mode</label>
            <select 
              id="cart-delivery-type" 
              value={deliveryType} 
              onChange={(e) => setDeliveryType(e.target.value)}
            >
              <option value="Same Day Delivery">🚀 Same Day Delivery (₹40)</option>
              <option value="Standard Door Delivery">📦 Standard Door Delivery (₹20)</option>
              <option value="Reserve & Collect">🏪 Reserve & Collect (Free)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cart-coupon-input">Discount Coupon</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                id="cart-coupon-input" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                placeholder="PLANTO50" 
              />
              <button className="btn" id="cart-apply-coupon" onClick={handleApplyCoupon} style={{ padding: '0 16px' }}>Apply</button>
            </div>
            <div id="coupon-msg" style={{ fontSize: '11px', marginTop: '4px', color: discountPercent > 0 ? 'var(--primary-green)' : '#d32f2f' }}>
              {couponMessage}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span id="cart-subtotal">₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Charge</span>
              <span id="cart-delivery-charge">₹{deliveryCharge}</span>
            </div>
            {discountPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d32f2f' }} id="cart-discount-row">
                <span>Coupon Discount</span>
                <span id="cart-discount">-₹{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '8px' }}>
              <span>Grand Total</span>
              <span id="cart-grand-total">₹{grandTotal}</span>
            </div>
          </div>

          <button className="btn" id="cart-checkout-submit" onClick={handleCheckout} style={{ width: '100%', justifyContent: 'center' }}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

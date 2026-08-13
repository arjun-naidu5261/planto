import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function DeliveryDashboardPage() {
  const { 
    orders, 
    updateOrderStatus,
    isLoggedIn, 
    currentUser,
    setShowLogin,
    setLoginPresetEmail,
    logoutUser
  } = useApp();

  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = () => {
    logoutUser();
    window.location.hash = "#/";
  };

  // Fallback gate if not delivery partner
  if (!isLoggedIn || currentUser?.role !== 'Delivery Partner') {
    return (
      <div className="page-view active" style={{ display: 'block', padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '80px auto' }}>
        <div style={{ background: 'var(--white)', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'float 4s infinite' }}>🛵</div>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '12px', color: 'var(--dark)' }}>Delivery Console Restricted</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
            Please sign in with a Delivery Partner account to access the delivery console, live route assignments, and earnings ledger.
          </p>
          <button 
            className="btn" 
            style={{ width: '100%', justifyContent: 'center', height: '46px', borderRadius: '10px' }} 
            onClick={() => {
              setLoginPresetEmail('delivery@planto.in');
              setShowLogin(true);
            }}
          >
            Sign In as Delivery Partner
          </button>
        </div>
      </div>
    );
  }

  // Active delivery orders (status is not 'Delivered')
  const activeDeliveries = orders.filter(o => o.status !== 'Delivered');
  const completedDeliveries = orders.filter(o => o.status === 'Delivered');

  // Stats calculation
  const baseEarnings = 540; // Mock historical earnings for today
  const deliveryFee = 60;   // Fee per order
  const todayEarnings = baseEarnings + (completedDeliveries.length * deliveryFee);
  const activeTripsCount = activeDeliveries.length;
  const completedTripsCount = completedDeliveries.length + 9; // Offset for demo

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'Confirmed' || currentStatus === 'Pending') {
      nextStatus = 'Picked Up';
    } else if (currentStatus === 'Picked Up') {
      nextStatus = 'Delivered';
    }
    
    if (nextStatus) {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        if (nextStatus === 'Delivered') {
          alert(`Order ${orderId} delivered! +₹${deliveryFee} credited to your ledger.`);
        } else {
          alert(`Order ${orderId} picked up. Proceed to customer address.`);
        }
      } else {
        alert(res.message || "Failed to update order status.");
      }
    }
  };

  return (
    <div id="view-delivery" className="page-view active" style={{ display: 'block' }}>
      {/* Title block */}
      <div className="section-title-row" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="section-title">Delivery Partner Console</h2>
          <p className="section-subtitle">Manage water-plant routes, update drop-off logs, and verify earnings ledger.</p>
        </div>
        
        {/* Actions Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Duty Status Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--white)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: isOnline ? 'var(--primary-green)' : '#999' }}>
              {isOnline ? '🟢 ON DUTY' : '⚪ OFFLINE'}
            </span>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              style={{
                width: '46px',
                height: '24px',
                borderRadius: '12px',
                background: isOnline ? 'var(--primary-green)' : '#ccc',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              <div 
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: isOnline ? '25px' : '3px',
                  transition: 'left 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              />
            </button>
          </div>

          {/* Exit/Logout Button removed */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="vendor-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--light-green) 0%, rgba(255,255,255,0.9) 100%)' }}>
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>Today's Earnings</span>
          <span className="stat-num" style={{ color: 'var(--primary-green)' }}>₹{todayEarnings}</span>
        </div>
        <div className="stat-card">
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>Active Deliveries</span>
          <span className="stat-num" style={{ color: activeTripsCount > 0 ? 'var(--accent-gold)' : 'var(--dark)' }}>{activeTripsCount}</span>
        </div>
        <div className="stat-card">
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>Completed Trips</span>
          <span className="stat-num">{completedTripsCount}</span>
        </div>
        <div className="stat-card">
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>Partner Rating</span>
          <span className="stat-num" style={{ color: 'var(--primary-green)' }}>4.9 ★</span>
        </div>
      </div>

      {!isOnline ? (
        <div style={{ background: 'var(--white)', padding: '50px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: '#888', border: '1px dashed #ccc' }}>
          <h3>You are currently offline</h3>
          <p style={{ marginTop: '8px' }}>Toggle your duty status to Online to receive active plant delivery routes.</p>
        </div>
      ) : (
        <div className="stall-grid-sections">
          {/* Left: Active deliveries & tracking */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Active Delivery Tasks</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeDeliveries.length === 0 ? (
                <div style={{ background: 'var(--white)', padding: '40px 20px', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#888', border: '1px solid rgba(0,0,0,0.03)' }}>
                  🎉 No active deliveries! Relax or wait for customers to place new orders.
                </div>
              ) : (
                activeDeliveries.map(order => {
                  const statusBadgeStyle = {
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  };

                  if (order.status === 'Confirmed' || order.status === 'Pending') {
                    statusBadgeStyle.background = '#e3f2fd';
                    statusBadgeStyle.color = '#1e88e5';
                  } else {
                    statusBadgeStyle.background = '#fff8e1';
                    statusBadgeStyle.color = '#f57f17';
                  }

                  return (
                    <div 
                      key={order.id} 
                      className="stall-hours-box"
                      style={{ 
                        background: 'var(--white)', 
                        padding: '20px', 
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        borderLeft: '5px solid var(--primary-green)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px' }}>Order ID: {order.id}</span>
                        <span style={statusBadgeStyle}>
                          {order.status === 'Confirmed' || order.status === 'Pending' ? 'Ready for Pickup' : 'In Transit'}
                        </span>
                      </div>
                      
                      {/* Delivery addresses */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px', borderLeft: '2px dashed rgba(0,0,0,0.1)', paddingLeft: '14px', marginLeft: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#888', display: 'block', fontWeight: 600 }}>PICKUP FROM</span>
                          <strong>{order.vendorName || 'Sai Baba Plant Stall'}</strong>
                          <span style={{ color: '#666', display: 'block', fontSize: '12px' }}>Opp Metro Pillar 124, Indiranagar</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#888', display: 'block', fontWeight: 600 }}>DROP TO</span>
                          <strong>Suhas K. (Customer)</strong>
                          <span style={{ color: '#666', display: 'block', fontSize: '12px' }}>Indiranagar Sector 3, Bengaluru</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ fontSize: '12px', background: '#fafafa', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Plants in Trip:</strong>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.name} (x{item.quantity})</span>
                            <span>₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>Delivery Payout</span>
                          <strong style={{ fontSize: '16px', color: 'var(--primary-green)' }}>₹{deliveryFee}</strong>
                        </div>
                        
                        <button 
                          className="btn" 
                          onClick={() => handleUpdateStatus(order.id, order.status)}
                          style={{ borderRadius: 'var(--radius-pill)', padding: '8px 20px', fontSize: '13px' }}
                        >
                          {order.status === 'Confirmed' || order.status === 'Pending' ? '🚚 Mark Picked Up' : '✅ Mark Delivered'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: GPS Routing mockup & completed ledger */}
          <div>
            {/* GPS Tracking Route Card */}
            {activeDeliveries.length > 0 && (
              <div className="stall-hours-box" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>GPS Route Navigation</h3>
                <div style={{ background: '#f5f5f3', borderRadius: '12px', padding: '20px', position: 'relative', height: '180px', overflow: 'hidden' }}>
                  {/* Mock Map Route Design */}
                  <svg width="100%" height="100%" viewBox="0 0 300 140" style={{ pointerEvents: 'none' }}>
                    {/* Path line */}
                    <path 
                      d="M 50 100 Q 150 20 250 80" 
                      fill="none" 
                      stroke="#888" 
                      strokeWidth="4" 
                      strokeDasharray="6 4"
                    />
                    
                    <path 
                      d="M 50 100 Q 150 20 250 80" 
                      fill="none" 
                      stroke="var(--primary-green)" 
                      strokeWidth="4" 
                      strokeDasharray="100"
                      strokeDashoffset="30"
                      style={{ animation: 'shimmer 2s infinite linear' }}
                    />
                    
                    {/* Pickup marker */}
                    <circle cx="50" cy="100" r="8" fill="var(--earth-brown)" />
                    <text x="30" y="120" fill="var(--dark)" fontSize="9" fontWeight="700">STALL</text>

                    {/* Delivery Scooter */}
                    <g transform="translate(140, 48)">
                      <circle cx="0" cy="0" r="10" fill="var(--primary-green)" />
                      <text x="-5" y="3" fill="white" fontSize="10" fontWeight="bold">🛵</text>
                    </g>

                    {/* Drop-off marker */}
                    <circle cx="250" cy="80" r="8" fill="var(--accent-gold)" />
                    <text x="235" y="100" fill="var(--dark)" fontSize="9" fontWeight="700">HOME</text>
                  </svg>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', fontWeight: 600 }}>
                    <span>Distance: 1.2 km</span>
                    <span style={{ color: 'var(--primary-green)' }}>Est: 6 mins remaining</span>
                  </div>
                </div>
              </div>
            )}

            {/* Earnings Ledger History */}
            <div className="stall-hours-box">
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Earnings Ledger (Today)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completedDeliveries.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '15px' }}>
                    No orders delivered yet today. Completed earnings will log here.
                  </div>
                ) : (
                  completedDeliveries.map((order, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f5f5f5', fontSize: '12px' }}>
                      <div>
                        <strong>Order {order.id}</strong>
                        <span style={{ display: 'block', color: '#666', fontSize: '11px' }}>Stall: {order.vendorName}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>+₹{deliveryFee}</span>
                        <span style={{ display: 'block', color: '#888', fontSize: '10px' }}>Delivered</span>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Historical Mock Entries */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f5f5f5', fontSize: '12px', opacity: 0.7 }}>
                  <div>
                    <strong>Order ORD-9014</strong>
                    <span style={{ display: 'block', color: '#666', fontSize: '11px' }}>Stall: Green Flora Roadside Nursery</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>+₹60</span>
                    <span style={{ display: 'block', color: '#888', fontSize: '10px' }}>12:45 PM</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f5f5f5', fontSize: '12px', opacity: 0.7 }}>
                  <div>
                    <strong>Order ORD-7822</strong>
                    <span style={{ display: 'block', color: '#666', fontSize: '11px' }}>Stall: Balaji Premium Gardening</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>+₹60</span>
                    <span style={{ display: 'block', color: '#888', fontSize: '10px' }}>11:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

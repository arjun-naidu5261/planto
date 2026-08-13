import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function VendorDashboardPage() {
  const { 
    products, 
    activeVendorId, 
    vendors,
    setShowAddProduct, 
    setEditingProduct, 
    setShowQRDownload,
    updateProduct,
    deleteProduct,
    isLoggedIn,
    currentUser,
    setShowLogin,
    setLoginPresetEmail,
    logoutUser
  } = useApp();

  // Active tab state
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventorySubTab, setInventorySubTab] = useState('dashboard');
  const [ordersSubTab, setOrdersSubTab] = useState('all');
  const [businessSubTab, setBusinessSubTab] = useState('earnings');

  // Gating access for Vendors only
  const isVendor = isLoggedIn && currentUser?.role === 'Vendor';
  
  if (!isVendor) {
    return (
      <div className="page-view active" style={{ display: 'block', padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '80px auto' }}>
        <div style={{ background: 'var(--white)', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--primary-green)', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'float 4s infinite' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '12px', color: 'var(--dark)' }}>Vendor Desk Restricted</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
            Please sign in with a Vendor account to access the nursery inventory panel, adjust stock levels, and download stall QR codes.
          </p>
          <button 
            className="btn" 
            style={{ width: '100%', justifyContent: 'center', height: '46px', borderRadius: '10px' }} 
            onClick={() => {
              setLoginPresetEmail('vendor@planto.in');
              setShowLogin(true);
            }}
          >
            Sign In as Vendor
          </button>
        </div>
      </div>
    );
  }
  
  // Find current vendor metadata
  const currentVendor = vendors.find(v => v.id === activeVendorId) || {
    name: "Sai Baba Plant & Pot Stall",
    rating: 4.6,
    reviewsCount: 42
  };

  const vendorProducts = products.filter(p => p.vendorId === activeVendorId);

  const handleToggleStock = async (prod) => {
    const newQty = prod.quantity > 0 ? 0 : 10;
    await updateProduct(prod.id, { quantity: newQty });
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setShowAddProduct(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteProduct(id);
    }
  };

  const handleLogout = () => {
    logoutUser();
    window.location.hash = "#/";
  };

  // Mock bar chart data (15 sales points)
  const salesHistory = [
    { day: '01', val: 18 }, { day: '03', val: 32 }, { day: '05', val: 24 },
    { day: '08', val: 45 }, { day: '10', val: 30 }, { day: '12', val: 56 },
    { day: '15', val: 68 }, { day: '18', val: 40 }, { day: '20', val: 48 },
    { day: '22', val: 36 }, { day: '25', val: 58 }, { day: '28', val: 78 },
    { day: '30', val: 62 }
  ];

  // Helper hover animation styles for buttons and cards
  const applyCardHover = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
  };

  const removeCardHover = (e) => {
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.01)';
  };

  const applyBtnHover = (e) => {
    e.currentTarget.style.transform = 'scale(1.03)';
  };

  const removeBtnHover = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#f8f9fa', fontFamily: 'var(--font-main)' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside style={{ width: '250px', background: '#ffffff', borderRight: '1px solid #eef2f5', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


          {/* Main Navigation Group Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={() => setActiveTab('inventory')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'inventory' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'inventory' ? 'white' : '#4a5568', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { if (activeTab !== 'inventory') e.currentTarget.style.background = '#f7fafc'; }}
              onMouseOut={(e) => { if (activeTab !== 'inventory') e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Inventory
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'orders' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'orders' ? 'white' : '#4a5568', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { if (activeTab !== 'orders') e.currentTarget.style.background = '#f7fafc'; }}
              onMouseOut={(e) => { if (activeTab !== 'orders') e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Orders
              </span>
              <span style={{ background: activeTab === 'orders' ? '#fff' : '#e53e3e', color: activeTab === 'orders' ? 'var(--primary-green)' : 'white', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>12</span>
            </button>

            <button 
              onClick={() => setActiveTab('business')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'business' ? 'var(--primary-green)' : 'transparent', color: activeTab === 'business' ? 'white' : '#4a5568', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { if (activeTab !== 'business') e.currentTarget.style.background = '#f7fafc'; }}
              onMouseOut={(e) => { if (activeTab !== 'business') e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M6 3h12M6 8h12M14.5 3a5.5 5.5 0 0 1 0 11H6M6 14l9 9" />
              </svg>
              Business
            </button>
          </nav>


        </div>

        {/* Exit Desk Logout removed from sidebar */}
      </aside>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div style={{ flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Welcome back, {currentUser.name.split(' ')[0]} 
              <span style={{ fontSize: '11px', background: '#fffde7', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Premium Vendor
              </span>
            </h2>
            <p style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>Here's what's happening with your stall today.</p>
          </div>

          {/* Action buttons & Avatar removed */}
        </div>

        {/* Horizontal Sub-Navigation Row */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eef2f5', paddingBottom: '12px', marginBottom: '8px' }}>
          {activeTab === 'inventory' && (
            <>
              <button 
                onClick={() => setInventorySubTab('dashboard')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: inventorySubTab === 'dashboard' ? 'var(--primary-green)' : '#f3f4f6',
                  color: inventorySubTab === 'dashboard' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                Dashboard Overview
              </button>
              <button 
                onClick={() => setInventorySubTab('products')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: inventorySubTab === 'products' ? 'var(--primary-green)' : '#f3f4f6',
                  color: inventorySubTab === 'products' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                My Products Directory
              </button>
              <button 
                onClick={() => setInventorySubTab('categories')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: inventorySubTab === 'categories' ? 'var(--primary-green)' : '#f3f4f6',
                  color: inventorySubTab === 'categories' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                Categories Organizer
              </button>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <button 
                onClick={() => setOrdersSubTab('all')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: ordersSubTab === 'all' ? 'var(--primary-green)' : '#f3f4f6',
                  color: ordersSubTab === 'all' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                Customer Orders (12)
              </button>
              <button 
                onClick={() => setOrdersSubTab('delivery')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: ordersSubTab === 'delivery' ? 'var(--primary-green)' : '#f3f4f6',
                  color: ordersSubTab === 'delivery' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                Delivery Partner Requests
              </button>
            </>
          )}

          {activeTab === 'business' && (
            <>
              <button 
                onClick={() => setBusinessSubTab('earnings')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: businessSubTab === 'earnings' ? 'var(--primary-green)' : '#f3f4f6',
                  color: businessSubTab === 'earnings' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                Payout Wallet & Earnings
              </button>
              <button 
                onClick={() => setBusinessSubTab('coupons')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: businessSubTab === 'coupons' ? 'var(--primary-green)' : '#f3f4f6',
                  color: businessSubTab === 'coupons' ? '#ffffff' : '#4a5568',
                  transition: 'all 0.2s'
                }}
              >
                Coupons & Promotional Vouchers
              </button>
            </>
          )}
        </div>

        {/* Tab 1: Dashboard Panel */}
        {activeTab === 'inventory' && inventorySubTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stat Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {/* Stat 1 */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', transition: 'all 0.25s ease', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#e8f5e9', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12M6 8h12M14.5 3a5.5 5.5 0 0 1 0 11H6M6 14l9 9" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Total Revenue</span>
                </div>
                <strong style={{ fontSize: '20px', color: 'var(--dark)', display: 'block' }}>₹18,450</strong>
                <span style={{ fontSize: '10px', color: 'var(--primary-green)', fontWeight: 600 }}>↑ 24% from last month</span>
              </div>
              {/* Stat 2 */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', transition: 'all 0.25s ease', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#e8f5e9', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <polyline points="8 14 10 16 16 10" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Orders Completed</span>
                </div>
                <strong style={{ fontSize: '20px', color: 'var(--dark)', display: 'block' }}>24</strong>
                <span style={{ fontSize: '10px', color: 'var(--primary-green)', fontWeight: 600 }}>↑ 18% from last month</span>
              </div>
              {/* Stat 3 */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', transition: 'all 0.25s ease', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#e3f2fd', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#1e88e5' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Products Listed</span>
                </div>
                <strong style={{ fontSize: '20px', color: 'var(--dark)', display: 'block' }}>{vendorProducts.length + 42}</strong>
                <span style={{ fontSize: '10px', color: '#1e88e5', fontWeight: 600 }}>↑ 8% from last month</span>
              </div>
              {/* Stat 4 */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', transition: 'all 0.25s ease', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#fffde7', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Stall Views</span>
                </div>
                <strong style={{ fontSize: '20px', color: 'var(--dark)', display: 'block' }}>312</strong>
                <span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 600 }}>↑ 32% from last month</span>
              </div>
              {/* Stat 5 */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', transition: 'all 0.25s ease', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#f3e5f5', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8e24aa' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Average Rating</span>
                </div>
                <strong style={{ fontSize: '20px', color: 'var(--dark)', display: 'block' }}>4.6 ★</strong>
                <span style={{ fontSize: '10px', color: '#8e24aa', fontWeight: 600 }}>↑ 12% from last month</span>
              </div>
            </div>

            {/* Middle row: Sales chart, Order Pie Chart, Stall QR Code */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 280px', gap: '24px' }}>
              
              {/* Sales Overview Bar Chart */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', transition: 'all 0.25s ease' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Sales Overview</h3>
                  <select style={{ padding: '4px', border: '1px solid #edf2f7', borderRadius: '6px', fontSize: '11.5px', outline: 'none' }}>
                    <option>This Month</option>
                  </select>
                </div>

                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)', marginBottom: '16px' }}>
                  ₹18,450
                </div>

                {/* Vertical Bar Chart */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', padding: '0 10px', borderBottom: '1px solid #edf2f7', position: 'relative' }}>
                  {salesHistory.map((pt, i) => (
                    <div 
                      key={i} 
                      title={`₹${Math.round(pt.val * 240)} on ${pt.day} May`}
                      style={{ 
                        width: '12px', 
                        height: `${pt.val}%`, 
                        background: 'var(--primary-green)', 
                        borderRadius: '4px 4px 0 0', 
                        cursor: 'pointer',
                        transition: 'opacity 0.2s' 
                      }} 
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    />
                  ))}
                  
                  {/* Tooltip Simulation */}
                  <div style={{ position: 'absolute', top: '20px', left: '42%', background: '#1a202c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    <strong>₹2,450</strong> <br />15 May
                  </div>
                </div>

                {/* X Axis Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px 0 10px', fontSize: '10px', color: '#a0aec0' }}>
                  <span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                </div>
              </div>

              {/* Order Overview Pie Chart */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Order Overview</h3>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                  {/* SVG Donut Chart */}
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary-green)" strokeWidth="4" strokeDasharray="56 44" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffa726" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-56" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#29b6f6" strokeWidth="4" strokeDasharray="12 88" strokeDashoffset="-81" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef5350" strokeWidth="4" strokeDasharray="7 93" strokeDashoffset="-93" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <strong style={{ fontSize: '16px', display: 'block', color: 'var(--dark)' }}>32</strong>
                      <span style={{ fontSize: '8px', color: '#718096', display: 'block', marginTop: '-2px' }}>Orders</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-green)' }} />
                      <span>Delivered: <strong>18 (56%)</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffa726' }} />
                      <span>Pending: <strong>8 (25%)</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#29b6f6' }} />
                      <span>Processing: <strong>4 (12%)</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef5350' }} />
                      <span>Cancelled: <strong>2 (7%)</strong></span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setActiveTab('orders')} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', fontWeight: 700, textAlign: 'center', cursor: 'pointer', borderTop: '1px solid #edf2f7', paddingTop: '10px', marginTop: '10px' }}>
                  View All Orders &rarr;
                </button>
              </div>

              {/* Your Stall QR Code Card */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', textAlign: 'center', transition: 'all 0.25s ease' }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark)', marginBottom: '12px' }}>Your Stall QR Code</h3>
                
                {/* Stall QR block placeholder */}
                <div style={{ background: '#f7fafc', padding: '10px', borderRadius: '8px', display: 'inline-block', border: '1px solid #edf2f7', marginBottom: '10px' }}>
                  <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="8" height="8" rx="1" />
                    <rect x="14" y="2" width="8" height="8" rx="1" />
                    <rect x="2" y="14" width="8" height="8" rx="1" />
                    <circle cx="6" cy="6" r="2" fill="currentColor" />
                    <circle cx="18" cy="6" r="2" fill="currentColor" />
                    <circle cx="6" cy="18" r="2" fill="currentColor" />
                    <path d="M14 14h2v2h-2zm4 4h2v2h-2zm-2-2h4m-4 4h2" />
                  </svg>
                </div>

                <p style={{ fontSize: '10px', color: '#718096', margin: '0 auto 12px auto', width: '90%' }}>Let customers scan to view your live inventory</p>
                
                <button 
                  onClick={() => setShowQRDownload(true)} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '11px', padding: '8px', justifyContent: 'center', borderRadius: '8px', marginBottom: '8px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseOver={applyBtnHover}
                  onMouseOut={removeBtnHover}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download QR
                </button>
                <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 700, cursor: 'pointer', display: 'block' }}>Share Stall Link &larr;&rarr;</span>
              </div>

            </div>

            {/* Bottom Row: Top Selling Products Table & Recent Orders list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              
              {/* Top Selling Products */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', transition: 'all 0.25s ease' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Top Selling Products</h3>
                  <button onClick={() => { setActiveTab('inventory'); setInventorySubTab('products'); }} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View All Products &rarr;</button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #edf2f7', color: '#718096', textAlign: 'left' }}>
                      <th style={{ padding: '10px 16px 10px 0', fontWeight: 600 }}>Product</th>
                      <th style={{ padding: '10px 16px', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '10px 16px', fontWeight: 600 }}>Price</th>
                      <th style={{ padding: '10px 16px', fontWeight: 600 }}>Stock</th>
                      <th style={{ padding: '10px 16px', fontWeight: 600 }}>Sold</th>
                      <th style={{ padding: '10px 0 10px 16px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorProducts.slice(0, 5).map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '12px 16px 12px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={prod.images[0]} alt={prod.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                            <strong style={{ fontWeight: 600 }}>{prod.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#718096' }}>{prod.category}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{prod.price}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: prod.quantity > 0 ? 'var(--primary-green)' : '#e53e3e', fontWeight: 700 }}>
                            {prod.quantity}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#4a5568' }}>{prod.quantity + 18}</td>
                        <td style={{ padding: '12px 0 12px 16px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleEditClick(prod)} 
                            title="Edit Product"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--primary-green)', 
                              cursor: 'pointer', 
                              padding: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              borderRadius: '50%'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.18)';
                              e.currentTarget.style.background = 'rgba(46,125,50,0.05)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Orders List */}
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', transition: 'all 0.25s ease' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Orders</h3>
                  <button onClick={() => { setActiveTab('orders'); setOrdersSubTab('all'); }} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View All &rarr;</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fcfcf9', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', display: 'block' }}>ORD-1012</strong>
                      <span style={{ fontSize: '11px', color: '#718096' }}>Ramesh B. • ₹420</span>
                    </div>
                    <span style={{ fontSize: '10.5px', background: '#fffde7', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Processing</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fcfcf9', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', display: 'block' }}>ORD-1011</strong>
                      <span style={{ fontSize: '11px', color: '#718096' }}>Anitha M. • ₹180</span>
                    </div>
                    <span style={{ fontSize: '10.5px', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Confirmed</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fcfcf9', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', display: 'block' }}>ORD-1010</strong>
                      <span style={{ fontSize: '11px', color: '#718096' }}>Vikram S. • ₹720</span>
                    </div>
                    <span style={{ fontSize: '10.5px', background: '#e3f2fd', color: '#1e88e5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Out for Delivery</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fcfcf9', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', display: 'block' }}>ORD-1009</strong>
                      <span style={{ fontSize: '11px', color: '#718096' }}>Priya L. • ₹350</span>
                    </div>
                    <span style={{ fontSize: '10.5px', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Delivered</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer quick buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div 
                onClick={() => { setEditingProduct(null); setShowAddProduct(true); }} 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.25s ease' }}
              >
                <span style={{ background: '#e8f5e9', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)', fontSize: '18px', fontWeight: 'bold' }}>＋</span>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>Add New Product</strong>
                  <span style={{ fontSize: '10px', color: '#718096' }}>List new plants, seeds, soil...</span>
                </div>
              </div>
              <div 
                onClick={() => { setActiveTab('business'); setBusinessSubTab('earnings'); }} 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.25s ease' }}
              >
                <span style={{ background: '#e8f5e9', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>Sales Analytics</strong>
                  <span style={{ fontSize: '10px', color: '#718096' }}>Detailed report of your sales</span>
                </div>
              </div>
              <div 
                onClick={() => { setActiveTab('business'); setBusinessSubTab('coupons'); }} 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.25s ease' }}
              >
                <span style={{ background: '#e8f5e9', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </span>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>Promote Your Stall</strong>
                  <span style={{ fontSize: '10px', color: '#718096' }}>Boost visibility & get orders</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Products management */}
        {activeTab === 'inventory' && inventorySubTab === 'products' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                My Products Directory
              </h3>
              <button 
                className="btn" 
                onClick={() => { setEditingProduct(null); setShowAddProduct(true); }}
                style={{ transition: 'all 0.2s ease' }}
                onMouseOver={applyBtnHover}
                onMouseOut={removeBtnHover}
              >
                ＋ Add New Product
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>No items in inventory. Add your first item above!</td>
                    </tr>
                  ) : (
                    vendorProducts.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={prod.images[0]} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <span style={{ fontWeight: 600 }}>{prod.name}</span>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td>₹{prod.price}</td>
                        <td>
                          <span style={{ color: prod.quantity > 0 ? 'var(--primary-green)' : '#d32f2f', fontWeight: 700 }}>
                            {prod.quantity > 0 ? `${prod.quantity} In Stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => handleToggleStock(prod)} 
                              style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', transition: 'all 0.2s ease', cursor: 'pointer' }}
                              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.06)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                              {prod.quantity > 0 ? 'Mark OOS' : 'Restock (10)'}
                            </button>
                            
                            <button 
                              onClick={() => handleEditClick(prod)} 
                              title="Edit Product"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--primary-green)', 
                                cursor: 'pointer', 
                                padding: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                borderRadius: '50%'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.18)';
                                e.currentTarget.style.background = 'rgba(46,125,50,0.05)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                            </button>

                            <button 
                              onClick={() => handleDeleteClick(prod.id)} 
                              title="Delete Product"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#d32f2f', 
                                cursor: 'pointer', 
                                padding: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                borderRadius: '50%'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.18)';
                                e.currentTarget.style.background = 'rgba(211,47,47,0.05)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Categories */}
        {activeTab === 'inventory' && inventorySubTab === 'categories' && (
          <div 
            onMouseOver={applyCardHover}
            onMouseOut={removeCardHover}
            style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', transition: 'all 0.25s ease' }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Product Categories
            </h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Organize your plant inventory into categories for direct customer discoveries.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ border: '1px solid #edf2f7', padding: '16px', borderRadius: '10px', background: '#fcfcfc' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
                  </svg>
                  Indoor Plants
                </strong>
                <span style={{ fontSize: '11px', color: '#718096', display: 'block', marginTop: '4px' }}>E.g. Money plants, Snake plants</span>
              </div>
              <div style={{ border: '1px solid #edf2f7', padding: '16px', borderRadius: '10px', background: '#fcfcfc' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 5a3 3 0 1 0 0 6M12 13a3 3 0 1 0 0 6M5 12a3 3 0 1 0 6 0M13 12a3 3 0 1 0 6 0" />
                  </svg>
                  Flowering Plants
                </strong>
                <span style={{ fontSize: '11px', color: '#718096', display: 'block', marginTop: '4px' }}>E.g. Rose, Hibiscus, Adeniums</span>
              </div>
              <div style={{ border: '1px solid #edf2f7', padding: '16px', borderRadius: '10px', background: '#fcfcfc' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                    <path d="M3 3h18v6H3zM3 11h18v10H3z" />
                  </svg>
                  Pots & Soil
                </strong>
                <span style={{ fontSize: '11px', color: '#718096', display: 'block', marginTop: '4px' }}>E.g. Terracotta pots, Vermicompost</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Orders received */}
        {activeTab === 'orders' && ordersSubTab === 'all' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Customer Orders Received
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ border: '1px solid #edf2f7', padding: '16px', borderRadius: '12px', transition: 'all 0.25s ease', background: '#fff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700 }}>
                  <span>Order #ORD-1012</span>
                  <span style={{ color: 'var(--accent-gold)' }}>PROCESSING</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Customer: Ramesh B. • Address: Indiranagar Sector 2 • Total: ₹420
                </div>
                <div style={{ fontSize: '13px', marginTop: '8px' }}>
                  Items: Premium Golden Pothos x1
                </div>
              </div>
              <div 
                onMouseOver={applyCardHover}
                onMouseOut={removeCardHover}
                style={{ border: '1px solid #edf2f7', padding: '16px', borderRadius: '12px', transition: 'all 0.25s ease', background: '#fff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700 }}>
                  <span>Order #ORD-1011</span>
                  <span style={{ color: 'var(--primary-green)' }}>CONFIRMED</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Customer: Anitha M. • Address: Domlur Layout • Total: ₹180
                </div>
                <div style={{ fontSize: '13px', marginTop: '8px' }}>
                  Items: Mini Jade Plant x1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Delivery Requests */}
        {activeTab === 'orders' && ordersSubTab === 'delivery' && (
          <div 
            onMouseOver={applyCardHover}
            onMouseOut={removeCardHover}
            style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', transition: 'all 0.25s ease' }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Delivery Partner Dispatch Requests
            </h3>
            <p style={{ fontSize: '13px', color: '#666' }}>Active delivery partner pickups scheduled for your nursery stall inventory.</p>
            <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '8px', border: '1px solid #edf2f7', marginTop: '12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50', flexShrink: 0 }} />
              <span><strong>Ramu Prasad (Delivery Partner)</strong> is assigned to collect <strong>Order #ORD-1010</strong>. Pickup expected in 15 minutes.</span>
            </div>
          </div>
        )}

        {/* Tab 7: Earnings info */}
        {activeTab === 'business' && businessSubTab === 'earnings' && (
          <div style={{ maxWidth: '500px' }}>
            <div 
              onMouseOver={applyCardHover}
              onMouseOut={removeCardHover}
              className="stall-hours-box" 
              style={{ background: 'linear-gradient(135deg, var(--light-green) 0%, rgba(255,255,255,0.9) 100%)', border: 'none', transition: 'all 0.25s' }}
            >
              <h3 style={{ fontSize: '16px', color: 'var(--earth-brown)', marginBottom: '8px', fontWeight: 600 }}>Nursery Payout Wallet</h3>
              <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--primary-green)' }}>
                ₹18,450
              </div>
              <p style={{ fontSize: '12.5px', color: '#4a5568', marginTop: '6px' }}>
                Your payout earnings are settled securely to your linked savings bank account every Tuesday morning.
              </p>
              <div style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
                <strong>Linked Account:</strong> State Bank of India ••••• 9874
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Coupons */}
        {activeTab === 'business' && businessSubTab === 'coupons' && (
          <div 
            onMouseOver={applyCardHover}
            onMouseOut={removeCardHover}
            style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', transition: 'all 0.25s' }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Promotional Coupons & Offers
            </h3>
            <p style={{ fontSize: '13px', color: '#666' }}>Setup checkout codes or discounts to drive roadside customers directly to your Stall QR code.</p>
            <button className="btn" style={{ marginTop: '12px', transition: 'all 0.2s' }} onMouseOver={applyBtnHover} onMouseOut={removeBtnHover}>+ Create New Voucher</button>
          </div>
        )}

        {/* Tab 9: Stall Profile Details */}
        {activeTab === 'stall_profile' && (
          <div style={{ maxWidth: '500px' }}>
            <div 
              onMouseOver={applyCardHover}
              onMouseOut={removeCardHover}
              className="stall-hours-box"
              style={{ transition: 'all 0.25s' }}
            >
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-green)' }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Nursery Stall Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>PHYSICAL STALL NAME</span>
                  <strong>{currentVendor.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>RATING SCORE</span>
                  <strong>{currentVendor.rating} ★ ({currentVendor.reviewsCount} reviews)</strong>
                </div>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>BUSINESS LOCATION</span>
                  <strong>Sai Baba Nursery, Indiranagar Near Metro Station, Bengaluru</strong>
                </div>
                <div>
                  <span style={{ color: '#888', display: 'block', fontSize: '11px' }}>BANK IFSC</span>
                  <strong>SBIN0008432</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

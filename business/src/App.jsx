import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5002/api';
const DEFAULT_PLANT_IMG = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';

export default function App() {
  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState(null); // { name, role: 'Vendor' | 'Delivery Partner', email }
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('vendor@planto.in');
  const [loginPassword, setLoginPassword] = useState('planto123');
  
  // Registration Form State
  const [regRole, setRegRole] = useState('Vendor'); // 'Vendor' or 'Delivery Partner'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDetail, setRegDetail] = useState(''); // Nursery Address or Vehicle Type
  
  // Sidebar Toggle State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Nursery Dashboard States
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [storeOpen, setStoreOpen] = useState(true);
  const [vendorTab, setVendorTab] = useState('dashboard'); // 'dashboard' | 'inventory' | 'orders' | 'revenue' | 'status' | 'profile'
  
  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdType, setNewProdType] = useState('plant');
  const [newProdCategory, setNewProdCategory] = useState('Indoor Plants');
  const [newProdPrice, setNewProdPrice] = useState(250);
  const [newProdStock, setNewProdStock] = useState(15);
  const [newProdImg, setNewProdImg] = useState(DEFAULT_PLANT_IMG);

  // Delivery Partner Dashboard States
  const [dutyStatus, setDutyStatus] = useState(true);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [riderTab, setRiderTab] = useState('dashboard'); // 'dashboard' | 'active' | 'history' | 'earnings' | 'status' | 'profile'
  const [pastDeliveries, setPastDeliveries] = useState([
    { id: 'ORD-8812', date: 'Yesterday', vendor: 'Sai Baba Plant Stall', customer: 'Aditi S.', payout: 75, rating: '⭐ 5.0' },
    { id: 'ORD-8740', date: '12 Aug 2026', vendor: 'Green Flora Nursery', customer: 'Rohan M.', payout: 60, rating: '⭐ 5.0' },
    { id: 'ORD-8691', date: '11 Aug 2026', vendor: 'Balaji Gardening Hub', customer: 'Kavya P.', payout: 80, rating: '⭐ 4.8' }
  ]);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/products`);
      const pData = await pRes.json();
      setVendorProducts(pData);

      const oRes = await fetch(`${API_BASE}/orders`);
      const oData = await oRes.json();
      setVendorOrders(oData);
      setDeliveryOrders(oData);
    } catch (err) {
      console.error('API load error:', err);
    }
  };

  const getImageSrc = (prod) => {
    const url = prod?.images?.[0];
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
    const name = (prod?.name || '').toLowerCase();
    if (name.includes('snake')) return 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=600&q=80';
    if (name.includes('jade') || name.includes('succulent')) return 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=600&q=80';
    if (name.includes('hibiscus') || name.includes('flower') || name.includes('rose')) return 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=600&q=80';
    if (name.includes('bonsai') || name.includes('ficus')) return 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80';
    if (name.includes('pot') || name.includes('planter')) return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80';
    if (name.includes('soil') || name.includes('manure')) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80';
    return DEFAULT_PLANT_IMG;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail.includes('delivery')) {
      setCurrentUser({
        name: 'Ramu Prasad',
        email: loginEmail,
        role: 'Delivery Partner',
        vehicle: 'Hero Electric Scooter (KA 05 EQ 8821)',
        phone: '+91 98765 12345',
        totalEarnings: 4250,
        completedTrips: 42
      });
      setRiderTab('dashboard');
    } else {
      setCurrentUser({
        name: 'Suresh Rao',
        email: loginEmail,
        role: 'Vendor',
        nurseryName: 'Sai Baba Plant & Pot Stall',
        address: 'Opposite Metro Station Pillar 124, Indiranagar, Bengaluru',
        phone: '+91 98480 22334',
        hours: '7:00 AM - 7:30 PM'
      });
      setVendorTab('dashboard');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      alert('Please fill out all required fields.');
      return;
    }
    setCurrentUser({
      name: regName,
      email: regEmail,
      role: regRole,
      phone: regPhone,
      nurseryName: regRole === 'Vendor' ? regDetail || `${regName}'s Nursery` : null,
      vehicle: regRole === 'Delivery Partner' ? regDetail || 'EV Two-Wheeler' : null,
      address: regRole === 'Vendor' ? 'Indiranagar, Bengaluru' : null,
      hours: '8:00 AM - 8:00 PM',
      totalEarnings: 0,
      completedTrips: 0
    });
    if (regRole === 'Vendor') setVendorTab('dashboard');
    else setRiderTab('dashboard');
    alert(`🎉 Account created successfully as ${regRole}! Welcome to Planto Business.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newProd = {
      id: 'p' + Date.now(),
      name: newProdName || 'New Nursery Item',
      type: newProdType,
      category: newProdCategory,
      price: parseFloat(newProdPrice),
      quantity: parseInt(newProdStock),
      images: [newProdImg || DEFAULT_PLANT_IMG],
      vendorId: 'v1',
      rating: 5.0,
      reviewsCount: 0
    };

    try {
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
    } catch (err) {
      console.error(err);
    }

    setVendorProducts([newProd, ...vendorProducts]);
    setShowAddProductModal(false);
    alert('✅ New item added to your Nursery live catalog!');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = vendorOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setVendorOrders(updated);
    setDeliveryOrders(updated);
  };

  const handleCompleteRiderDelivery = (ord) => {
    handleUpdateOrderStatus(ord.id, 'Delivered to Doorstep ✅');
    setPastDeliveries([
      { id: ord.id, date: 'Just now', vendor: ord.vendorName || 'Sai Baba Plant Stall', customer: 'Customer', payout: 65, rating: '⭐ 5.0' },
      ...pastDeliveries
    ]);
    alert(`🎉 Order #${ord.id} completed! ₹65 credited to your wallet.`);
  };

  // --- 1. BUSINESS PARTNER LANDING PAGE (WHEN NOT LOGGED IN) ---
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f9f5', color: '#1b4332', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* HEADER NAVBAR (Full Width Edge-to-Edge Corner Buttons) */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'linear-gradient(90deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#fff',
          padding: '16px 32px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(27,67,50,0.2)',
          width: '100vw',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🪴</span>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#fff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Business</h2>
              <span style={{ fontSize: '10px', background: '#ffb703', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>PARTNER NETWORK</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '36px', fontSize: '14px', fontWeight: 700 }}>
            <a href="#motive" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Our Motive</a>
            <a href="#nurseries" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Nursery Stalls</a>
            <a href="#delivery" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Delivery Fleet</a>
            <a href="#payouts" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Commission & Payouts</a>
          </nav>

          {/* Extreme Right Corner Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🔑 Login
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              style={{ background: '#ffb703', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,183,3,0.3)', whiteSpace: 'nowrap' }}
            >
              ✨ Sign Up
            </button>
          </div>
        </header>

        {/* HERO SECTION */}
        <section style={{
          padding: '70px 32px 50px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #e8f5e9 0%, #f4f9f5 100%)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <span style={{ background: '#2d6a4f', color: '#fff', padding: '6px 18px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block' }}>
            🌿 INDIA'S HYPERLOCAL PLANT & NURSERY NETWORK
          </span>

          <h1 style={{ fontSize: '46px', fontFamily: 'var(--font-serif)', marginTop: '20px', marginBottom: '16px', lineHeight: 1.15, color: '#1b4332' }}>
            Empowering Local Nurseries & Delivery Partners<br />With <span>Same-Day Green Commerce</span>
          </h1>

          <p style={{ fontSize: '16px', color: '#4a5568', maxWidth: '780px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Planto connects roadside plant stalls, terracotta pottery artisans, and green delivery riders directly with nearby urban plant lovers for 3-5 hour hydrated doorstep deliveries.
          </p>

          {/* DUAL PARTNER CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', textAlign: 'left' }}>
            
            {/* NURSERY STALL OWNER CARD */}
            <div style={{ 
              background: '#ffffff', 
              border: '2px solid #2d6a4f', 
              borderRadius: '24px', 
              padding: '36px', 
              display: 'flex', 
              flexDirection: 'column', 
              justify: 'space-between', 
              boxShadow: '0 12px 32px rgba(45,106,79,0.1)' 
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#e8f5e9', color: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                    🏪
                  </div>
                  <span style={{ background: '#2d6a4f', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                    8% LOW COMMISSION
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: '#2d6a4f', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>For Nursery Owners & Pottery Artisans</span>
                <h3 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: '#1b4332', margin: '6px 0 12px 0' }}>Partner as a Nursery Owner</h3>
                <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.5, marginBottom: '24px' }}>
                  Put your physical nursery online in 2 minutes. Receive live orders for live plants, ceramic planters, organic compost & seeds with direct 92% earnings retention.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', fontSize: '13px', color: '#2d3748', display: 'flex', flexDirection: 'column', gap: '10px', fontWeight: 600 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#2e7d32', fontWeight: 900 }}>✓</span> 8% Low Commission (Keep 92% sales revenue)</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#2e7d32', fontWeight: 900 }}>✓</span> Free Moisture Preservation Packaging Kits</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#2e7d32', fontWeight: 900 }}>✓</span> Real-Time Live Stock & Order Control</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#2e7d32', fontWeight: 900 }}>✓</span> Direct Weekly Bank Payouts</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => { setLoginEmail('vendor@planto.in'); setAuthMode('login'); setShowAuthModal(true); }}
                  style={{ flex: 1, background: '#1b4332', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}
                >
                  🏪 Sign In as Nursery Owner
                </button>
                <button 
                  onClick={() => { setRegRole('Vendor'); setAuthMode('register'); setShowAuthModal(true); }}
                  style={{ background: '#e8f5e9', color: '#1b4332', border: '1px solid #a5d6a7', padding: '14px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
                >
                  Register Stall
                </button>
              </div>
            </div>

            {/* DELIVERY RIDER CARD */}
            <div style={{ 
              background: '#ffffff', 
              border: '2px solid #ffb703', 
              borderRadius: '24px', 
              padding: '36px', 
              display: 'flex', 
              flexDirection: 'column', 
              justify: 'space-between', 
              boxShadow: '0 12px 32px rgba(255,183,3,0.15)' 
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#fff8e1', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                    🛵
                  </div>
                  <span style={{ background: '#ffb703', color: '#000', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                    ₹65+ PER ORDER
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>For Delivery Fleet Riders</span>
                <h3 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: '#1b4332', margin: '6px 0 12px 0' }}>Partner as a Delivery Rider</h3>
                <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.5, marginBottom: '24px' }}>
                  Deliver live saplings & ceramic planters safely across your city. Flexible same-day delivery slots with guaranteed per-trip earnings & plant care bonuses.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', fontSize: '13px', color: '#2d3748', display: 'flex', flexDirection: 'column', gap: '10px', fontWeight: 600 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#d97706', fontWeight: 900 }}>✓</span> ₹65 Base Payout + ₹10 Plant Care Bonus / Order</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#d97706', fontWeight: 900 }}>✓</span> 3-5 Hour Flexible Delivery Slots</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#d97706', fontWeight: 900 }}>✓</span> EV Two-Wheeler & Fuel Allowance Perks</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#d97706', fontWeight: 900 }}>✓</span> Weekly Wallet Credit & Instant Withdrawal</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => { setLoginEmail('delivery@planto.in'); setAuthMode('login'); setShowAuthModal(true); }}
                  style={{ flex: 1, background: '#ffb703', color: '#000', border: 'none', padding: '14px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 14px rgba(255,183,3,0.3)' }}
                >
                  🛵 Sign In as Delivery Partner
                </button>
                <button 
                  onClick={() => { setRegRole('Delivery Partner'); setAuthMode('register'); setShowAuthModal(true); }}
                  style={{ background: '#fff8e1', color: '#b45309', border: '1px solid #ffe082', padding: '14px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
                >
                  Join Fleet
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: PLATFORM MOTIVE & HOW PLANTO WORKS */}
        <section id="motive" style={{ padding: '70px 32px', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ background: '#e8f5e9', color: '#1b4332', padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                🎯 OUR PURPOSE & MOTIVE
              </span>
              <h2 style={{ fontSize: '34px', fontFamily: 'var(--font-serif)', color: '#1b4332', marginTop: '12px', marginBottom: '8px' }}>
                Bridging Physical Nurseries With Urban Plant Lovers
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
                Thousands of local plant nurseries and pottery artisans struggle with footfall despite growing plant demand. Planto brings physical nursery stalls online with a 3-step hyperlocal delivery model.
              </p>
            </div>

            {/* 3-STEP MOTIVE WORKFLOW GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              
              <div style={{ background: '#f8faf9', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#1b4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', marginBottom: '20px' }}>
                  1
                </div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#1b4332', marginBottom: '10px' }}>Nursery Keeps Stock Online</h3>
                <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
                  Nursery stall owners update live stock of plants, terracotta pots, seeds & vermicompost in 2 minutes using their phone.
                </p>
              </div>

              <div style={{ background: '#f8faf9', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ffb703', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', marginBottom: '20px' }}>
                  2
                </div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#1b4332', marginBottom: '10px' }}>3-5 Hr Same-Day Express Dispatch</h3>
                <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
                  Customers order live plants online. Delivery partners pick up moisture-packaged saplings directly from the stall.
                </p>
              </div>

              <div style={{ background: '#f8faf9', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', marginBottom: '20px' }}>
                  3
                </div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#1b4332', marginBottom: '10px' }}>Direct 92% Payout & Bonuses</h3>
                <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
                  With a low 8% platform fee, 92% of order revenue goes directly to the nursery owner, while riders earn ₹65+ per trip.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION: WHY PARTNER WITH PLANTO */}
        <section id="payouts" style={{ padding: '70px 32px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: '30px', fontFamily: 'var(--font-serif)', color: '#1b4332' }}>Why Partners Love Planto</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '4px' }}>Built specifically for physical nursery operations and green logistics</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>⏱️</div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: '#1b4332' }}>3-5 Hr Same-Day SLA</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>Optimized delivery routes that keep live plants hydrated during transit.</p>
            </div>

            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>💰</div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: '#1b4332' }}>Low 8% Commission</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>Transparent pricing so nursery owners retain 92% of their retail margin.</p>
            </div>

            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>🪴</div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: '#1b4332' }}>Moisture Package Kits</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>Free eco-friendly moisture retention bags for live plant deliveries.</p>
            </div>

            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>📱</div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: '#1b4332' }}>Live Mobile Control</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>Manage plant stock, accept orders, and trigger payouts from your phone.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#1b4332', color: '#fff', padding: '40px 32px', textAlign: 'center', borderTop: '1px solid #2d6a4f' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
            <span>🪴</span> PLANTO Business Partner Network
          </div>
          <p style={{ fontSize: '13px', color: '#d8f3dc', marginTop: '8px' }}>
            Empowering 500+ nursery stalls and delivery partners across India.
          </p>
          <div style={{ fontSize: '12px', color: '#a5d6a7', marginTop: '16px' }}>
            © 2026 PLANTO Partner Systems. All rights reserved.
          </div>
        </footer>

        {/* AUTH MODAL OVERLAY */}
        {showAuthModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '20px'
          }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', borderRadius: '24px', background: '#fff', color: '#000', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <button 
                onClick={() => setShowAuthModal(false)}
                style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
              >
                ✕
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: '#1b4332', margin: 0 }}>
                  {authMode === 'login' ? 'Partner Portal Sign In' : 'New Partner Registration'}
                </h2>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                  {authMode === 'login' ? 'Access your Nursery Stall or Rider Console' : 'Join the Planto Partner Network'}
                </p>
              </div>

              {/* Modal Switch Tabs */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                <button 
                  onClick={() => setAuthMode('login')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: authMode === 'login' ? '#fff' : 'transparent', fontWeight: 800, fontSize: '13px', cursor: 'pointer', color: authMode === 'login' ? '#1b4332' : '#666' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthMode('register')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: authMode === 'register' ? '#fff' : 'transparent', fontWeight: 800, fontSize: '13px', cursor: 'pointer', color: authMode === 'register' ? '#1b4332' : '#666' }}
                >
                  Register
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={(e) => { handleLogin(e); setShowAuthModal(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#333' }}>Email Address</label>
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#333' }}>Password</label>
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '14px' }} />
                  </div>

                  <div style={{ background: '#f8faf9', padding: '12px', borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', marginBottom: '6px', color: '#1b4332' }}>⚡ Quick Demo Login Presets:</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 10px', background: '#e8f5e9', color: '#1b4332', border: 'none', borderRadius: '8px', fontWeight: 700 }} onClick={() => setLoginEmail('vendor@planto.in')}>
                        🏪 Nursery Owner
                      </button>
                      <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 10px', background: '#fff8e1', color: '#b45309', border: 'none', borderRadius: '8px', fontWeight: 700 }} onClick={() => setLoginEmail('delivery@planto.in')}>
                        🛵 Delivery Partner
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn" style={{ justifyContent: 'center', height: '46px', fontSize: '15px', fontWeight: 800, background: '#1b4332', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                    Enter Dashboard →
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => { handleRegister(e); setShowAuthModal(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px', display: 'block', color: '#1b4332' }}>Registering as:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setRegRole('Vendor')}
                        style={{ padding: '10px', borderRadius: '10px', border: regRole === 'Vendor' ? '2px solid #1b4332' : '1px solid #ccc', background: regRole === 'Vendor' ? '#e8f5e9' : '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                      >
                        🏪 Nursery Owner
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRegRole('Delivery Partner')}
                        style={{ padding: '10px', borderRadius: '10px', border: regRole === 'Delivery Partner' ? '2px solid #ffb703' : '1px solid #ccc', background: regRole === 'Delivery Partner' ? '#fff8e1' : '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                      >
                        🛵 Delivery Rider
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                    <input type="text" placeholder="e.g. Suresh Rao" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address</label>
                    <input type="email" placeholder="owner@nursery.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Number</label>
                    <input type="tel" placeholder="+91 98480 22334" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>

                  <button type="submit" className="btn btn-accent" style={{ justifyContent: 'center', height: '44px', fontSize: '14px', fontWeight: 800, background: '#ffb703', color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                    Complete Registration →
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- 2. NURSERY OWNER CLEAN SIDEBAR DASHBOARD ---
  if (currentUser.role === 'Vendor') {
    const totalSalesRevenue = vendorOrders.reduce((sum, o) => sum + (o.total || 0), 0) + 5030;

    const vendorSidebarItems = [
      { id: 'dashboard', label: 'Overall Dashboard', icon: '📊' },
      { id: 'inventory', label: 'My Plant Inventory', icon: '🪴', count: vendorProducts.length },
      { id: 'orders', label: 'Live Customer Orders', icon: '📦', count: vendorOrders.length },
      { id: 'revenue', label: 'Revenue & Payouts', icon: '💰' },
      { id: 'status', label: `Store Status (${storeOpen ? 'Open 🟢' : 'Closed 🔴'})`, icon: storeOpen ? '🟢' : '🔴' },
      { id: 'profile', label: 'Nursery Store Profile', icon: '🏪' }
    ];

    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#f8faf9' }}>
        
        {/* LEFT SIDEBAR CONTAINER (STICKY FULL HEIGHT WITH ZERO GAPS) */}
        <aside style={{
          width: sidebarOpen ? '260px' : '76px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: '#0a231b',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          zIndex: 100,
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}>
          {/* Sidebar Brand Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            {sidebarOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🏪</span>
                <div>
                  <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)' }}>PLANTO Nursery</h3>
                  <span style={{ fontSize: '10px', color: '#a7f3d0' }}>Partner Console</span>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '24px', margin: '0 auto' }}>🏪</span>
            )}

            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation Menu (Fills naturally with flex: 1) */}
          <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
            {vendorSidebarItems.map(item => {
              const active = vendorTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'status') {
                      setStoreOpen(!storeOpen);
                    } else {
                      setVendorTab(item.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: active ? 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)' : 'transparent',
                    color: active ? '#fff' : '#b7e4c7',
                    fontWeight: active ? 800 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {sidebarOpen && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && item.count !== undefined && (
                    <span style={{ background: active ? '#ffb703' : 'rgba(255,255,255,0.2)', color: active ? '#000' : '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* CLEAN SIDEBAR FOOTER: USER NAME STUCK AT VERY BOTTOM */}
          <div style={{ padding: '18px 14px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', marginTop: 'auto', flexShrink: 0 }}>
            {sidebarOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {currentUser.nurseryName || 'Sai Baba Stall'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#a7f3d0' }}>
                      {currentUser.name} (Owner)
                    </div>
                  </div>
                </div>

                {/* Logout Button right below User Name */}
                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s ease' }}
                >
                  🚪 Logout Account
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'block', margin: '0 auto' }} title="Logout Account">
                🚪
              </button>
            )}
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                {vendorSidebarItems.find(i => i.id === vendorTab)?.label}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {currentUser.nurseryName || 'Sai Baba Plant & Pot Stall'} • Live Operations Console
              </p>
            </div>

            {vendorTab === 'inventory' && (
              <button className="btn btn-accent" style={{ color: '#000', fontWeight: 800 }} onClick={() => setShowAddProductModal(true)}>
                + Add New Plant / Pot Item
              </button>
            )}
          </div>

          {/* TAB 0: OVERALL DASHBOARD */}
          {vendorTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Overview Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ background: '#fff', borderLeft: '4px solid #2e7d32' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL REVENUE</span>
                  <h3 style={{ fontSize: '28px', color: '#2e7d32', marginTop: '4px', margin: 0 }}>₹{totalSalesRevenue.toLocaleString()}</h3>
                  <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 700, marginTop: '6px', display: 'block' }}>↑ 18% vs last week</span>
                </div>
                <div className="card" style={{ background: '#fff', borderLeft: '4px solid var(--primary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>LIVE CUSTOMER ORDERS</span>
                  <h3 style={{ fontSize: '28px', color: 'var(--primary)', marginTop: '4px', margin: 0 }}>{vendorOrders.length} Pending</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>Ready for hydration packing</span>
                </div>
                <div className="card" style={{ background: '#fff', borderLeft: '4px solid #1976d2' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>PLANTS & POTS LISTED</span>
                  <h3 style={{ fontSize: '28px', color: '#1976d2', marginTop: '4px', margin: 0 }}>{vendorProducts.length} Items</h3>
                  <span style={{ fontSize: '11px', color: '#1976d2', fontWeight: 700, marginTop: '6px', display: 'block' }}>Live in customer store</span>
                </div>
                <div className="card" style={{ background: '#fff', borderLeft: '4px solid #ffb703' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>NURSERY RATING</span>
                  <h3 style={{ fontSize: '28px', color: '#d48806', marginTop: '4px', margin: 0 }}>⭐ 4.8 / 5.0</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>Based on 42 customer reviews</span>
                </div>
              </div>

              {/* Revenue Graph & Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                
                {/* Sales Chart Bar Card */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: 0 }}>Weekly Revenue & Sales Trend</h3>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>August 2026</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '150px', paddingTop: '20px', borderBottom: '1px solid #f0f0f0' }}>
                    {[
                      { day: 'Mon', val: 650, height: '40%' },
                      { day: 'Tue', val: 890, height: '55%' },
                      { day: 'Wed', val: 1200, height: '75%' },
                      { day: 'Thu', val: 950, height: '60%' },
                      { day: 'Fri', val: 1450, height: '90%' },
                      { day: 'Sat', val: 1800, height: '100%' },
                      { day: 'Sun', val: 1100, height: '70%' }
                    ].map((bar, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#666', fontWeight: 700 }}>₹{bar.val}</span>
                        <div style={{ width: '100%', height: bar.height, background: i === 5 ? '#2d6a4f' : '#b7e4c7', borderRadius: '6px 6px 0 0' }}></div>
                        <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', marginBottom: '14px' }}>Quick Operations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button className="btn btn-accent" style={{ color: '#000', fontWeight: 800, justifyContent: 'flex-start' }} onClick={() => setShowAddProductModal(true)}>
                        ➕ Add Plant or Pot Item
                      </button>
                      <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setVendorTab('orders')}>
                        📦 Check Live Customer Orders ({vendorOrders.length})
                      </button>
                      <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setVendorTab('revenue')}>
                        💰 Withdraw Bank Payout
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '12px', fontSize: '11px', marginTop: '16px' }}>
                    <strong style={{ color: '#2e7d32' }}>💡 Pro Tip for Nursery Owners:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#1b4332' }}>Items with hydration packaging badges get 40% higher customer repeat orders!</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders Stream */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: 0 }}>Recent Orders Stream</h3>
                  <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setVendorTab('orders')}>
                    View All Orders →
                  </button>
                </div>

                {vendorOrders.map((ord) => (
                  <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>🪴</span>
                      <div>
                        <strong style={{ fontSize: '14px' }}>Order #{ord.id}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ord.date} • Total ₹{ord.total}</div>
                      </div>
                    </div>

                    <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}>
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 1: INVENTORY TABLE */}
          {vendorTab === 'inventory' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '1px solid var(--border-color)', fontWeight: 800 }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Item Photo & Name</th>
                    <th style={{ padding: '14px 20px' }}>Category</th>
                    <th style={{ padding: '14px 20px' }}>Price</th>
                    <th style={{ padding: '14px 20px' }}>Stock</th>
                    <th style={{ padding: '14px 20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorProducts.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img 
                          src={getImageSrc(prod)} 
                          alt={prod.name} 
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', background: '#f0f0f0' }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_PLANT_IMG;
                          }}
                        />
                        <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{prod.name}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{prod.category}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 800, color: 'var(--primary)' }}>₹{prod.price}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ background: prod.quantity > 0 ? '#e8f5e9' : '#ffebee', color: prod.quantity > 0 ? '#2e7d32' : '#c62828', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}>
                          {prod.quantity > 0 ? `${prod.quantity} Available` : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => {
                            const newStock = prompt(`Update stock quantity for ${prod.name}:`, prod.quantity);
                            if (newStock !== null) {
                              setVendorProducts(vendorProducts.map(p => p.id === prod.id ? { ...p, quantity: parseInt(newStock) } : p));
                            }
                          }}
                        >
                          ✏️ Edit Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: LIVE ORDERS */}
          {vendorTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vendorOrders.map((ord) => (
                <div key={ord.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '16px' }}>Order #{ord.id}</span>
                      <span style={{ background: '#ffb703', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>⚡ 30-MIN EXPRESS</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Customer Order • Date: {ord.date} • Total: <strong style={{ color: 'var(--primary)' }}>₹{ord.total}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#2e7d32' }}>Status: {ord.status}</span>
                    <button 
                      className="btn" 
                      style={{ fontSize: '12px', padding: '8px 14px' }}
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Hydration Pack Prepared 🪴')}
                    >
                      Pack Plant with Moisture Wrap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REVENUE & PAYOUTS */}
          {vendorTab === 'revenue' && (
            <div>
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>Wallet Balance & Payout Settings</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faf9', padding: '20px', borderRadius: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>AVAILABLE FOR PAYOUT</span>
                    <h2 style={{ fontSize: '32px', color: '#2e7d32', margin: '4px 0 0 0' }}>₹{totalSalesRevenue.toLocaleString()}</h2>
                  </div>
                  <button className="btn btn-accent" style={{ color: '#000', padding: '12px 24px', fontWeight: 800 }} onClick={() => alert("🎉 Payout request of ₹" + totalSalesRevenue + " submitted to your bank account!")}>
                    Withdraw Payout to Bank →
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <h4 style={{ padding: '16px 20px', background: '#f8faf9', borderBottom: '1px solid var(--border-color)', margin: 0 }}>Past Settlement History</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 20px' }}>Date</th>
                      <th style={{ padding: '12px 20px' }}>Settlement ID</th>
                      <th style={{ padding: '12px 20px' }}>Amount</th>
                      <th style={{ padding: '12px 20px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>12 Aug 2026</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>PAY-9921</td>
                      <td style={{ padding: '12px 20px', fontWeight: 800, color: '#2e7d32' }}>₹3,450</td>
                      <td style={{ padding: '12px 20px', color: '#2e7d32', fontWeight: 800 }}>Completed ✅</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 20px' }}>05 Aug 2026</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>PAY-9810</td>
                      <td style={{ padding: '12px 20px', fontWeight: 800, color: '#2e7d32' }}>₹4,120</td>
                      <td style={{ padding: '12px 20px', color: '#2e7d32', fontWeight: 800 }}>Completed ✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {vendorTab === 'profile' && (
            <div className="card" style={{ maxWidth: '650px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Nursery Store Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
                <div>
                  <strong>Store Name:</strong> {currentUser.nurseryName || 'Sai Baba Plant & Pot Stall'}
                </div>
                <div>
                  <strong>Owner Name:</strong> {currentUser.name}
                </div>
                <div>
                  <strong>Phone Number:</strong> {currentUser.phone || '+91 98480 22334'}
                </div>
                <div>
                  <strong>Store Address:</strong> {currentUser.address || 'Indiranagar, Bengaluru'}
                </div>
                <div>
                  <strong>Working Hours:</strong> {currentUser.hours || '7:00 AM - 7:30 PM'}
                </div>
              </div>
            </div>
          )}

          {/* Modal: Add Product */}
          {showAddProductModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '28px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0 }}>Add Product to Nursery Inventory</h3>
                  <button onClick={() => setShowAddProductModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                </div>

                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>Plant / Pot Title</label>
                    <input type="text" placeholder="e.g. Monstera Deliciosa / Terracotta Pot" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700 }}>Category</label>
                      <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)}>
                        <option value="Indoor Plants">Indoor Plants</option>
                        <option value="Outdoor Plants">Outdoor Plants</option>
                        <option value="Pots & Containers">Pots & Containers</option>
                        <option value="Soil Collection">Soil & Manure</option>
                        <option value="Seeds Collection">Seeds</option>
                        <option value="Tools & Care">Tools & Care</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700 }}>Item Type</label>
                      <select value={newProdType} onChange={(e) => setNewProdType(e.target.value)}>
                        <option value="plant">Plant</option>
                        <option value="pot">Pot</option>
                        <option value="soil">Soil</option>
                        <option value="seed">Seed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700 }}>Selling Price (₹)</label>
                      <input type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} required />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700 }}>Stock Quantity</label>
                      <input type="number" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>Image URL</label>
                    <input type="url" value={newProdImg} onChange={(e) => setNewProdImg(e.target.value)} required />
                  </div>

                  <button type="submit" className="btn" style={{ justifyContent: 'center', height: '46px', marginTop: '10px' }}>
                    Save & Publish to Nursery Catalog →
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  // --- 3. DELIVERY PARTNER CLEAN SIDEBAR DASHBOARD ---
  const riderSidebarItems = [
    { id: 'dashboard', label: 'Overall Rider Dashboard', icon: '📊' },
    { id: 'active', label: 'Active Nursery Pick-ups', icon: '🛵', count: deliveryOrders.length },
    { id: 'history', label: 'Past Delivery Trips', icon: '📜', count: pastDeliveries.length },
    { id: 'earnings', label: 'Earnings & UPI Payouts', icon: '💰' },
    { id: 'status', label: `Duty Status (${dutyStatus ? 'Online 🟢' : 'Offline 🔴'})`, icon: dutyStatus ? '🟢' : '🔴' },
    { id: 'profile', label: 'Rider Profile & Vehicle', icon: '👤' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', color: '#fff' }}>
      
      {/* RIDER LEFT SIDEBAR (STICKY FULL HEIGHT WITH ZERO GAPS) */}
      <aside style={{
        width: sidebarOpen ? '260px' : '76px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🛵</span>
              <div>
                <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)' }}>Planto Rider</h3>
                <span style={{ fontSize: '10px', color: '#38bdf8' }}>Express Console</span>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '24px', margin: '0 auto' }}>🛵</span>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
            title="Toggle Sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu Nav (Fills naturally with flex: 1) */}
        <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          {riderSidebarItems.map(item => {
            const active = riderTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'status') {
                    setDutyStatus(!dutyStatus);
                  } else {
                    setRiderTab(item.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#0284c7' : 'transparent',
                  color: '#fff',
                  fontWeight: active ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {sidebarOpen && item.count !== undefined && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* CLEAN RIDER SIDEBAR FOOTER: USER NAME STUCK AT VERY BOTTOM */}
        <div style={{ padding: '18px 14px', borderTop: '1px solid #334155', background: 'rgba(0,0,0,0.3)', marginTop: 'auto', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                    {currentUser.vehicle || 'Delivery Partner'}
                  </div>
                </div>
              </div>

              {/* Logout Button right below User Name */}
              <button 
                onClick={handleLogout}
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #334155', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s ease' }}
              >
                🚪 Logout Account
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'block', margin: '0 auto' }} title="Logout Account">
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* RIDER MAIN CONTENT */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#fff' }}>
              {riderSidebarItems.find(i => i.id === riderTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              {currentUser.name} • {currentUser.vehicle}
            </p>
          </div>
        </div>

        {/* TAB 0: OVERALL RIDER DASHBOARD */}
        {riderTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Rider Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #22c55e', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>TODAY'S EARNINGS</span>
                <h3 style={{ fontSize: '28px', color: '#4ade80', marginTop: '4px', margin: 0 }}>₹640</h3>
                <span style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px', display: 'block' }}>Includes ₹80 Plant Care Bonus</span>
              </div>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #38bdf8', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>DELIVERIES COMPLETED</span>
                <h3 style={{ fontSize: '28px', color: '#38bdf8', marginTop: '4px', margin: 0 }}>{pastDeliveries.length + 5} Orders</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>100% On-Time SLA</span>
              </div>
              <div className="card" style={{ background: '#1e293b', borderLeft: '4px solid #f59e0b', color: '#fff' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>CUSTOMER RATING</span>
                <h3 style={{ fontSize: '28px', color: '#fbbf24', marginTop: '4px', margin: 0 }}>⭐ 4.9 / 5.0</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>Based on 48 deliveries</span>
              </div>
            </div>

            {/* Weekly Earnings Bar Chart & Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div className="card" style={{ background: '#1e293b', color: '#fff' }}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: '0 0 16px 0' }}>Weekly Rider Payout Breakdown</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px', paddingTop: '20px', borderBottom: '1px solid #334155' }}>
                  {[
                    { day: 'Mon', val: 420, h: '50%' },
                    { day: 'Tue', val: 560, h: '70%' },
                    { day: 'Wed', val: 680, h: '85%' },
                    { day: 'Thu', val: 510, h: '65%' },
                    { day: 'Fri', val: 720, h: '95%' },
                    { day: 'Sat', val: 840, h: '100%' },
                    { day: 'Sun', val: 640, h: '80%' }
                  ].map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>₹{bar.val}</span>
                      <div style={{ width: '100%', height: bar.h, background: i === 6 ? '#22c55e' : '#38bdf8', borderRadius: '6px 6px 0 0' }}></div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', margin: '0 0 14px 0' }}>Rider Controls</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn btn-accent" style={{ color: '#000', fontWeight: 800 }} onClick={() => setRiderTab('active')}>
                      🛵 Go to Active Pick-ups ({deliveryOrders.length})
                    </button>
                    <button className="btn btn-secondary" style={{ color: '#fff' }} onClick={() => setRiderTab('earnings')}>
                      💰 Instant UPI Payout
                    </button>
                  </div>
                </div>

                <div style={{ background: '#0284c7', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#fff', marginTop: '16px' }}>
                  <strong>⚡ Plant Safety Reminder:</strong>
                  <p style={{ margin: '4px 0 0 0' }}>Keep plant boxes upright during scooter transport to earn +₹10 hydration bonus!</p>
                </div>
              </div>
            </div>

            {/* Active Pickups Stream */}
            <div className="card" style={{ background: '#1e293b', color: '#fff' }}>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Live Pickup Queue Nearby</h3>
              {deliveryOrders.map((ord) => (
                <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                  <div>
                    <strong style={{ fontSize: '15px' }}>Order #{ord.id} • {ord.vendorName || 'Sai Baba Plant Stall'}</strong>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Pick-up: Indiranagar ➔ Drop: 100ft Road (1.4 km)</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '16px' }}>+₹65 Payout</div>
                    <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', marginTop: '4px' }} onClick={() => handleCompleteRiderDelivery(ord)}>
                      Complete Delivery ✅
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 1: ACTIVE PICKUPS */}
        {riderTab === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {deliveryOrders.map((ord) => (
              <div key={ord.id} className="card" style={{ background: '#1e293b', color: '#fff', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ background: '#ffb703', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>⚡ 30-MIN PLANT DELIVERY</span>
                    <h4 style={{ fontSize: '18px', marginTop: '6px' }}>Order #{ord.id} • {ord.vendorName || 'Sai Baba Plant Stall'}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                      Pick-up: Indiranagar Metro Pillar 124 ➔ Drop: 100ft Road, Indiranagar (1.4 km)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>+₹65 Payout</div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Incl. Plant Care Bonus</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>Status: {ord.status}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '12px' }}
                      onClick={() => alert(`Navigating to ${ord.vendorName} on GPS map...`)}
                    >
                      📍 GPS Map Navigation
                    </button>
                    <button 
                      className="btn" 
                      style={{ fontSize: '12px' }}
                      onClick={() => handleCompleteRiderDelivery(ord)}
                    >
                      Complete Delivery ✅
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: TRIP HISTORY */}
        {riderTab === 'history' && (
          <div className="card" style={{ background: '#1e293b', color: '#fff', padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#0f172a', borderBottom: '1px solid #334155', fontWeight: 800 }}>
                <tr>
                  <th style={{ padding: '14px 20px' }}>Order ID</th>
                  <th style={{ padding: '14px 20px' }}>Nursery</th>
                  <th style={{ padding: '14px 20px' }}>Customer</th>
                  <th style={{ padding: '14px 20px' }}>Payout</th>
                  <th style={{ padding: '14px 20px' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {pastDeliveries.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 800 }}>{item.id}</td>
                    <td style={{ padding: '12px 20px' }}>{item.vendor}</td>
                    <td style={{ padding: '12px 20px', color: '#94a3b8' }}>{item.customer}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 800, color: '#4ade80' }}>+₹{item.payout}</td>
                    <td style={{ padding: '12px 20px', color: '#ffb703', fontWeight: 800 }}>{item.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: EARNINGS & PAYOUTS */}
        {riderTab === 'earnings' && (
          <div className="card" style={{ background: '#1e293b', color: '#fff' }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Rider Wallet & Weekly Earnings</h3>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>UNSETTLED BALANCE</span>
                <h2 style={{ fontSize: '32px', color: '#4ade80', margin: '4px 0 0 0' }}>₹640</h2>
              </div>
              <button className="btn btn-accent" style={{ color: '#000', padding: '12px 20px', fontWeight: 800 }} onClick={() => alert("🎉 ₹640 transferred to your UPI account!")}>
                Instant Payout to UPI →
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: RIDER PROFILE */}
        {riderTab === 'profile' && (
          <div className="card" style={{ background: '#1e293b', color: '#fff', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Delivery Rider Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div><strong>Name:</strong> {currentUser.name}</div>
              <div><strong>Phone:</strong> {currentUser.phone || '+91 98765 12345'}</div>
              <div><strong>Vehicle:</strong> {currentUser.vehicle || 'Electric Two-Wheeler'}</div>
              <div><strong>Delivery Zone:</strong> Indiranagar & Koramangala, Bengaluru</div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

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
  const [regDetail, setRegDetail] = useState(''); // Nursery Stall Name
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regVehicle, setRegVehicle] = useState('Hero Electric Scooter');
  const [regVehicleNum, setRegVehicleNum] = useState('');
  const [regDlNum, setRegDlNum] = useState('');
  const [regDlDoc, setRegDlDoc] = useState('');
  const [dlFileName, setDlFileName] = useState('');
  const [dlFileType, setDlFileType] = useState('');
  const [regAadhaarNum, setRegAadhaarNum] = useState('');
  const [regAadhaarDoc, setRegAadhaarDoc] = useState('');
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [aadhaarFileType, setAadhaarFileType] = useState('');
  const [authError, setAuthError] = useState('');
  
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

  const [categories, setCategories] = useState([]);

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

      const cRes = await fetch(`${API_BASE}/categories`);
      const cData = await cRes.json();
      if (cData && Array.isArray(cData)) setCategories(cData);
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
    return DEFAULT_PLANT_IMG;
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller PDF or image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (docType === 'dl') {
        setRegDlDoc(dataUrl);
        setDlFileName(file.name);
        setDlFileType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));
      } else if (docType === 'aadhaar') {
        setRegAadhaarDoc(dataUrl);
        setAadhaarFileName(file.name);
        setAadhaarFileType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Login failed. Please check credentials.');
        return;
      }

      if (data.user.role === 'Delivery Partner') {
        setCurrentUser({
          name: data.user.name || 'Delivery Partner',
          email: data.user.email,
          role: 'Delivery Partner',
          vehicle: 'Hero Electric Scooter',
          phone: '+91 98450 11223',
          totalEarnings: 4250,
          completedTrips: 42
        });
        setRiderTab('dashboard');
      } else {
        setCurrentUser({
          name: data.user.name || 'Suresh Rao',
          email: data.user.email,
          role: 'Vendor',
          nurseryName: 'Sai Baba Plant & Pot Stall',
          address: 'Opposite Metro Station Pillar 124, Indiranagar, Bengaluru',
          phone: '+91 98480 22334',
          hours: '7:00 AM - 7:30 PM'
        });
        setVendorTab('dashboard');
      }
      setShowAuthModal(false);
    } catch (err) {
      console.error(err);
      setAuthError('Server error logging in.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regAddress) {
      alert('Please fill out required fields: Name, Email, Password, Address.');
      return;
    }

    if (regRole === 'Delivery Partner') {
      try {
        const res = await fetch(`${API_BASE}/riders/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regName,
            email: regEmail,
            password: regPassword,
            phone: regPhone,
            address: regAddress,
            vehicle: regVehicle,
            vehicleNumber: regVehicleNum || 'KA-05-EQ-8821',
            drivingLicense: regDlNum,
            aadhaar: regAadhaarNum,
            dlDoc: regDlDoc,
            dlFileName: dlFileName || 'Driving_License.pdf',
            dlFileType: dlFileType || 'application/pdf',
            aadhaarDoc: regAadhaarDoc,
            aadhaarFileName: aadhaarFileName || 'Aadhaar_Card.pdf',
            aadhaarFileType: aadhaarFileType || 'application/pdf'
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.message || 'Registration failed.');
          return;
        }
        alert('🎉 Delivery Rider Registration Submitted!\n\nYour application along with Driving License & Aadhaar Card has been submitted to Super Admin for verification. Once approved, you will be able to log in to your Rider Console.');
        setShowAuthModal(false);
      } catch (err) {
        console.error(err);
        alert('Registration error. Please check server connection.');
      }
    } else {
      setCurrentUser({
        name: regName,
        email: regEmail,
        role: 'Vendor',
        phone: regPhone,
        address: regAddress,
        nurseryName: regDetail || `${regName}'s Nursery Stall`,
        hours: '8:00 AM - 8:00 PM',
        totalEarnings: 0,
        completedTrips: 0
      });
      setVendorTab('dashboard');
      setShowAuthModal(false);
      alert(`🎉 Account created successfully as Nursery Owner! Welcome to Planto Business.`);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '40px' }}>
            <span style={{ fontSize: '32px' }}>🪴</span>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#fff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Business</h2>
              <span style={{ fontSize: '10px', background: '#ffb703', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>PARTNER NETWORK</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '14px', fontWeight: 700 }}>
            <a href="#motive" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Our Motive</a>
            <a href="#nurseries" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Nursery Stalls</a>
            <a href="#delivery" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Delivery Fleet</a>
            <a href="#payouts" style={{ color: '#d8f3dc', textDecoration: 'none' }}>Commission & Payouts</a>
          </nav>

          {/* Extreme Right Corner Action Buttons (Symbols Removed) */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Login
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              style={{ background: '#ffb703', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,183,3,0.3)', whiteSpace: 'nowrap' }}
            >
              Sign Up
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

        {/* AUTH MODAL OVERLAY (Smooth Glassmorphic Animation & Centered) */}
        {showAuthModal && (
          <div className="modal-backdrop-animated" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 35, 27, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="card modal-content-animated" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '36px', borderRadius: '24px', background: '#fff', color: '#000', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', margin: 'auto' }}>
              <button 
                onClick={() => { setShowAuthModal(false); setAuthError(''); }}
                style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', fontWeight: 800, cursor: 'pointer', color: '#666' }}
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
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
                <button 
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: authMode === 'login' ? '#fff' : 'transparent', fontWeight: 800, fontSize: '13px', cursor: 'pointer', color: authMode === 'login' ? '#1b4332' : '#666' }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: authMode === 'register' ? '#fff' : 'transparent', fontWeight: 800, fontSize: '13px', cursor: 'pointer', color: authMode === 'register' ? '#1b4332' : '#666' }}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '12px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 700, marginBottom: '18px', lineHeight: 1.5 }}>
                  {authError}
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#333' }}>Email Address</label>
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block', color: '#333' }}>Password</label>
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '14px' }} />
                  </div>

                  <div style={{ background: '#f8faf9', padding: '12px', borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', marginBottom: '6px', color: '#1b4332' }}>Quick Demo Login Presets:</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" style={{ fontSize: '11px', padding: '6px 10px', background: '#e8f5e9', color: '#1b4332', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }} onClick={() => { setLoginEmail('vendor@planto.in'); setLoginPassword('planto123'); }}>
                        Nursery Owner
                      </button>
                      <button type="button" style={{ fontSize: '11px', padding: '6px 10px', background: '#fff8e1', color: '#b45309', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }} onClick={() => { setLoginEmail('delivery@planto.in'); setLoginPassword('delivery123'); }}>
                        Approved Delivery Partner
                      </button>
                    </div>
                  </div>

                  <button type="submit" style={{ justifyContent: 'center', height: '46px', fontSize: '15px', fontWeight: 800, background: '#1b4332', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}>
                    Enter Dashboard →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px', display: 'block', color: '#1b4332' }}>Registering as:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setRegRole('Vendor')}
                        style={{ padding: '10px', borderRadius: '10px', border: regRole === 'Vendor' ? '2px solid #1b4332' : '1px solid #ccc', background: regRole === 'Vendor' ? '#e8f5e9' : '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                      >
                        Nursery Owner
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRegRole('Delivery Partner')}
                        style={{ padding: '10px', borderRadius: '10px', border: regRole === 'Delivery Partner' ? '2px solid #ffb703' : '1px solid #ccc', background: regRole === 'Delivery Partner' ? '#fff8e1' : '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                      >
                        Delivery Rider
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Full Name</label>
                      <input type="text" placeholder="e.g. Suresh Rao" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Email Address</label>
                      <input type="email" placeholder="owner@nursery.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Create Password</label>
                      <input type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Number</label>
                      <input type="tel" placeholder="+91 98480 22334" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Location Address (Street, Area, City)</label>
                    <input type="text" placeholder="e.g. #124, 100ft Road, Indiranagar, Bengaluru" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                  </div>

                  {regRole === 'Vendor' ? (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Nursery Stall Name</label>
                      <input type="text" placeholder="e.g. Sai Baba Plant & Pot Stall" value={regDetail} onChange={(e) => setRegDetail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8faf9', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1b4332', letterSpacing: '0.2px' }}>
                        Delivery Fleet Verification Documents
                      </span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Vehicle Model / Type</label>
                          <input type="text" placeholder="e.g. Hero Electric" value={regVehicle} onChange={(e) => setRegVehicle(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Vehicle Reg Number</label>
                          <input type="text" placeholder="e.g. KA-05-EQ-8821" value={regVehicleNum} onChange={(e) => setRegVehicleNum(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>
                      </div>

                      {/* Driving License Input & File Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Driving License Number</label>
                          <input type="text" placeholder="KA-01-2024-00129" value={regDlNum} onChange={(e) => setRegDlNum(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>

                        {/* PDF / Image File Dropzone for Driving License */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#64748b' }}>Driving License File (PDF or Image)</label>
                          {regDlDoc ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                {dlFileType?.includes('pdf') || dlFileName?.endsWith('.pdf') ? (
                                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 8px', borderRadius: '6px' }}>PDF</div>
                                ) : (
                                  <img src={regDlDoc} alt="DL Preview" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                  <strong style={{ fontSize: '12px', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{dlFileName || 'Driving_License_Document'}</strong>
                                  <span style={{ fontSize: '10.5px', color: '#15803d', fontWeight: 600 }}>File Uploaded Ready for Inspection</span>
                                </div>
                              </div>
                              <button type="button" onClick={() => { setRegDlDoc(''); setDlFileName(''); setDlFileType(''); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="dropzone-box" style={{ display: 'block' }}>
                              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'dl')} style={{ display: 'none' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1b4332' }}>Choose File or Drag & Drop</span>
                                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Supports PDF, JPG, PNG & WEBP (Max 10MB)</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Aadhaar Card Input & File Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>Aadhaar Card Number</label>
                          <input type="text" placeholder="4812-9901-3412" value={regAadhaarNum} onChange={(e) => setRegAadhaarNum(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }} />
                        </div>

                        {/* PDF / Image File Dropzone for Aadhaar Card */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#64748b' }}>Aadhaar Card File (PDF or Image)</label>
                          {regAadhaarDoc ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                {aadhaarFileType?.includes('pdf') || aadhaarFileName?.endsWith('.pdf') ? (
                                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 8px', borderRadius: '6px' }}>PDF</div>
                                ) : (
                                  <img src={regAadhaarDoc} alt="Aadhaar Preview" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                  <strong style={{ fontSize: '12px', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{aadhaarFileName || 'Aadhaar_Card_Document'}</strong>
                                  <span style={{ fontSize: '10.5px', color: '#15803d', fontWeight: 600 }}>File Uploaded Ready for Inspection</span>
                                </div>
                              </div>
                              <button type="button" onClick={() => { setRegAadhaarDoc(''); setAadhaarFileName(''); setAadhaarFileType(''); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="dropzone-box" style={{ display: 'block' }}>
                              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'aadhaar')} style={{ display: 'none' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1b4332' }}>Choose File or Drag & Drop</span>
                                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Supports PDF, JPG, PNG & WEBP (Max 10MB)</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" style={{ justifyContent: 'center', height: '46px', fontSize: '14.5px', fontWeight: 800, background: '#ffb703', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '6px', boxShadow: '0 4px 14px rgba(255,183,3,0.3)' }}>
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
      { id: 'dashboard', label: 'Overall Dashboard' },
      { id: 'inventory', label: 'My Plant Inventory', count: vendorProducts.length },
      { id: 'orders', label: 'Live Customer Orders', count: vendorOrders.length },
      { id: 'revenue', label: 'Revenue & Payouts' },
      { id: 'status', label: `Store Status (${storeOpen ? 'Open' : 'Closed'})` },
      { id: 'profile', label: 'Nursery Store Profile' }
    ];

    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#f8faf9' }}>
        
        {/* LEFT SIDEBAR CONTAINER (STICKY FULL HEIGHT WITH ELEGANT VERTICAL SPACING) */}
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
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            {sidebarOpen ? (
              <div>
                <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Nursery</h3>
                <span style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 700 }}>Partner Console</span>
              </div>
            ) : (
              <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 auto' }}>PN</span>
            )}

            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation Menu (Expanded vertical height & elegant spacing) */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
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
                    justify: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    background: active ? '#2d6a4f' : 'transparent',
                    color: '#fff',
                    fontWeight: active ? 800 : 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                  }}
                  onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {sidebarOpen && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && item.count !== undefined && (
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
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

          {/* TAB 4: NURSERY STORE PROFILE */}
          {vendorTab === 'profile' && (
            <div className="card" style={{ maxWidth: '720px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                    Nursery Store Profile & Settings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
                    Manage your physical stall details, operating hours, and seller info
                  </p>
                </div>

                <span style={{ background: '#e8f5e9', color: '#1b4332', border: '1px solid #c8e6c9', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                  ACTIVE SELLER
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13.5px' }}>
                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Nursery Stall Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                    {currentUser.nurseryName || 'Sai Baba Plant & Pot Stall'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Owner Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', marginTop: '4px' }}>
                    {currentUser.name}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.email}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone Contact</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.phone || '+91 98480 22334'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Stall Location Address</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.address || 'Opposite Metro Station Pillar 124, Indiranagar, Bengaluru'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Operating Hours</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {currentUser.hours || '7:00 AM - 7:30 PM'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Marketplace SLA</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2e7d32', marginTop: '4px' }}>
                    8.0% Low Commission (92% Payout)
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  // --- 3. DELIVERY PARTNER CLEAN SIDEBAR DASHBOARD ---
  const riderSidebarItems = [
    { id: 'dashboard', label: 'Rider Overview' },
    { id: 'active', label: 'Active Order Delivery', count: deliveryOrders.length },
    { id: 'history', label: 'Past Delivery Trips', count: pastDeliveries.length },
    { id: 'earnings', label: 'Wallet & Payouts' },
    { id: 'status', label: `Duty Status (${dutyStatus ? 'On Duty' : 'Off Duty'})` },
    { id: 'profile', label: 'Rider Profile & Vehicle Settings' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', color: '#fff' }}>
      
      {/* RIDER LEFT SIDEBAR (STICKY FULL HEIGHT WITH ELEGANT VERTICAL SPACING) */}
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
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div>
              <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>Planto Rider</h3>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>Express Console</span>
            </div>
          ) : (
            <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 auto' }}>PR</span>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
            title="Toggle Sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu Nav (Expanded vertical height & clean spacing) */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
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
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#0284c7' : 'transparent',
                  color: '#fff',
                  fontWeight: active ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                }}
                onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {sidebarOpen && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {sidebarOpen && item.count !== undefined && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
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
                Logout Account
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'block', margin: '0 auto' }} title="Logout Account">
              Exit
            </button>
          )}
        </div>
      </aside>

      {/* RIDER MAIN CONTENT */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0 }}>
              {riderSidebarItems.find(i => i.id === riderTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
              PLANTO Hyperlocal Express Delivery Console
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: dutyStatus ? '#16a34a' : '#dc2626', color: '#fff', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
              Status: {dutyStatus ? 'Online & Receiving Orders' : 'Offline'}
            </span>
          </div>
        </div>

        {/* TAB 0: DASHBOARD */}
        {riderTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

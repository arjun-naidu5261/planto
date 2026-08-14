import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5002/api';
const DEFAULT_PLANT_IMG = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';

// Professional SVG Icons (No Emojis)
const ViewIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EditIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 2 2h7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DisableIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

const EnableIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const DeleteIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const RejectIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@planto.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'categories' | 'vendors' | 'riders' | 'orders' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Category State
  const [categories, setCategories] = useState([
    { id: 'cat_1', name: 'Indoor Plants', description: 'Air-purifying foliage, shade lovers & succulents', itemCount: 12, status: 'Active' },
    { id: 'cat_2', name: 'Outdoor & Flowering Plants', description: 'Sun-loving flowering garden shrubs & climbers', itemCount: 8, status: 'Active' },
    { id: 'cat_3', name: 'Pots & Terracotta Planters', description: 'Handcrafted ceramic, terracotta & eco planters', itemCount: 15, status: 'Active' },
    { id: 'cat_4', name: 'Seeds & Organic Soil', description: 'Hybrid flower seeds, potting mix & bio fertilizers', itemCount: 10, status: 'Active' },
    { id: 'cat_5', name: 'Fresh Flower Bouquets', description: 'Hand-picked floral arrangements & gift hampers', itemCount: 6, status: 'Active' },
    { id: 'cat_6', name: 'Gardening Tools', description: 'Pruners, watering cans, sprayers & shears', itemCount: 5, status: 'Active' }
  ]);

  // Modal States
  const [selectedVendorForCatalog, setSelectedVendorForCatalog] = useState(null);
  const [selectedRiderForDocs, setSelectedRiderForDocs] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  
  // Segmented Pill Toggle Filter State
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');

  // Edit Vendor Form State
  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editType, setEditType] = useState('Roadside Seller');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editRating, setEditRating] = useState(4.8);

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Indoor Plants');
  const [newProdPrice, setNewProdPrice] = useState(199);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImg, setNewProdImg] = useState('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Admin Add Delivery Rider Form State
  const [adminRiderName, setAdminRiderName] = useState('');
  const [adminRiderEmail, setAdminRiderEmail] = useState('');
  const [adminRiderPassword, setAdminRiderPassword] = useState('rider123');
  const [adminRiderPhone, setAdminRiderPhone] = useState('');
  const [adminRiderAddress, setAdminRiderAddress] = useState('');
  const [adminRiderVehicle, setAdminRiderVehicle] = useState('Hero Electric Scooter');
  const [adminRiderVehicleNum, setAdminRiderVehicleNum] = useState('');
  const [adminRiderDlNum, setAdminRiderDlNum] = useState('');
  const [adminRiderDlDoc, setAdminRiderDlDoc] = useState('');
  const [adminRiderAadhaarNum, setAdminRiderAadhaarNum] = useState('');
  const [adminRiderAadhaarDoc, setAdminRiderAadhaarDoc] = useState('');
  const [adminRiderStatus, setAdminRiderStatus] = useState('APPROVED');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const vRes = await fetch(`${API_BASE}/vendors`);
      const vData = await vRes.json();
      setVendors(vData);

      const pRes = await fetch(`${API_BASE}/products`);
      const pData = await pRes.json();
      setProducts(pData);

      const oRes = await fetch(`${API_BASE}/orders`);
      const oData = await oRes.json();
      setOrders(oData);

      const cRes = await fetch(`${API_BASE}/categories`);
      const cData = await cRes.json();
      if (cData && Array.isArray(cData)) setCategories(cData);

      const rRes = await fetch(`${API_BASE}/riders`);
      const rData = await rRes.json();
      if (rData && Array.isArray(rData)) setRiders(rData);
    } catch (err) {
      console.error('Admin API error:', err);
    }
  };

  const getImageSrc = (prod) => {
    const url = prod?.images?.[0];
    if (url && typeof url === 'string' && url.startsWith('http')) return url;
    return DEFAULT_PLANT_IMG;
  };

  const handleToggleVendorApproval = (vendorId) => {
    setVendors(vendors.map(v => v.id === vendorId ? { ...v, isOpen: !v.isOpen } : v));
  };

  const handleOpenEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setEditName(vendor.name || '');
    setEditOwner(vendor.owner || '');
    setEditType(vendor.type || 'Roadside Seller');
    setEditPhone(vendor.phone || '+91 98480 22334');
    setEditAddress(vendor.address || 'Bengaluru, KA');
    setEditRating(vendor.rating || 4.8);
  };

  const handleSaveEditVendor = (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setVendors(vendors.map(v => v.id === editingVendor.id ? {
      ...v,
      name: editName,
      owner: editOwner,
      type: editType,
      phone: editPhone,
      address: editAddress,
      rating: parseFloat(editRating)
    } : v));
    setEditingVendor(null);
  };

  const handleConfirmDeleteVendor = () => {
    if (!deletingVendor) return;
    setVendors(vendors.filter(v => v.id !== deletingVendor.id));
    setProducts(products.filter(p => p.vendorId !== deletingVendor.id));
    setDeletingVendor(null);
  };

  const handleDeleteProductFromAdmin = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleAddProductToVendorSubmit = (e) => {
    e.preventDefault();
    if (!selectedVendorForCatalog || !newProdName.trim()) return;

    const newProduct = {
      id: `p_${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      type: newProdCategory.toLowerCase().includes('pot') ? 'pot' : 'plant',
      price: Number(newProdPrice),
      quantity: Number(newProdStock),
      vendorId: selectedVendorForCatalog.id,
      vendorName: selectedVendorForCatalog.name,
      rating: 4.8,
      reviewsCount: 1,
      description: `Premium quality ${newProdName} uploaded by ${selectedVendorForCatalog.name}.`,
      images: [newProdImg.trim() || DEFAULT_PLANT_IMG]
    };

    setProducts([newProduct, ...products]);
    setNewProdName('');
    setNewProdImg('');
    setShowAddProductModal(false);
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName.trim(),
          description: catDescription.trim() || 'Custom plant marketplace category'
        })
      });
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
      setCatName('');
      setCatDescription('');
      setShowAddCategoryModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await fetch(`${API_BASE}/categories/${catId}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== catId));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleUpdateRiderApproval = async (riderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/riders/${riderId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: newStatus } : r));
        if (selectedRiderForDocs?.id === riderId) {
          setSelectedRiderForDocs(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Error updating rider approval:', err);
    }
  };

  const handleAdminRegisterRiderSubmit = async (e) => {
    e.preventDefault();
    if (!adminRiderName || !adminRiderEmail || !adminRiderPhone) {
      alert('Please fill out required rider details (Name, Email, Phone).');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/riders/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminRiderName,
          email: adminRiderEmail,
          password: adminRiderPassword || 'rider123',
          phone: adminRiderPhone,
          address: adminRiderAddress || 'Bengaluru, KA',
          vehicle: adminRiderVehicle || 'Electric Scooter',
          vehicleNumber: adminRiderVehicleNum || 'KA-05-EQ-8821',
          drivingLicense: adminRiderDlNum || 'KA-01-2024-EXP',
          aadhaar: adminRiderAadhaarNum || '4812-9901-3412',
          dlDoc: adminRiderDlDoc || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          aadhaarDoc: adminRiderAadhaarDoc || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
          status: adminRiderStatus
        })
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRiders([data.rider, ...riders]);
        setShowAddRiderModal(false);
        setAdminRiderName('');
        setAdminRiderEmail('');
        setAdminRiderPhone('');
        setAdminRiderVehicleNum('');
        alert(`🎉 Delivery Partner '${adminRiderName}' registered successfully!\n\nCredentials Issued:\nEmail: ${adminRiderEmail}\nPassword: ${adminRiderPassword}`);
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error adding rider from admin:', err);
    }
  };

  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    if (!adminEmail) return;
    setIsAdminLoggedIn(true);
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)', padding: '20px', color: '#1b4332', fontFamily: 'var(--font-main)' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px', borderRadius: '24px', background: '#ffffff', border: '2px solid #2d6a4f', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', color: '#1b4332', margin: 0 }}>PLANTO Super Admin</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Master Operations & Platform Control Console</p>
          </div>

          <form onSubmit={handleAdminAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Admin Credentials Email</label>
              <input 
                type="email" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
                placeholder="admin@planto.in"
                required 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Security Password</label>
              <input 
                type="password" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1b4332', fontWeight: 700 }}>Demo Root Account:</span>
              <button 
                type="button" 
                onClick={() => { setAdminEmail('admin@planto.in'); setAdminPassword('admin123'); }}
                style={{ background: '#e8f5e9', color: '#1b4332', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}
              >
                Auto Fill Credentials
              </button>
            </div>

            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', height: '48px', background: '#1b4332', color: '#ffffff', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}>
              Access Super Admin Operations →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalGMV = orders.reduce((sum, o) => sum + (o.total || 0), 0) + 18500;
  const platformCommission = Math.round(totalGMV * 0.08);

  // Clean Sidebar Navigation without Emoji Symbols
  const adminSidebarItems = [
    { id: 'dashboard', label: 'Overall Platform Dashboard' },
    { id: 'categories', label: 'Category Management', count: categories.length },
    { id: 'vendors', label: 'Nursery Stalls Manager', count: vendors.length },
    { id: 'riders', label: 'Delivery Fleet Partners', count: riders.filter(r => r.status === 'PENDING_APPROVAL').length },
    { id: 'orders', label: 'Live Order Stream', count: orders.length },
    { id: 'settings', label: 'Platform Settings' }
  ];

  // Selected vendor products
  const selectedVendorProducts = selectedVendorForCatalog ? products.filter(p => p.vendorId === selectedVendorForCatalog.id || p.vendorName === selectedVendorForCatalog.name) : [];
  const filteredCatalogProducts = selectedVendorProducts.filter(p => {
    if (inventoryCategoryFilter === 'All') return true;
    const catLow = inventoryCategoryFilter.toLowerCase();
    const prodCat = (p.category || '').toLowerCase();
    return prodCat === catLow || prodCat.includes(catLow) || catLow.includes(prodCat);
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f9f5', color: '#1b4332', fontFamily: 'var(--font-main)' }}>
      
      {/* 1. CLEAN ORGANIC GREEN LEFT SIDEBAR WITH EXPANDED SPACING */}
      <aside style={{
        width: sidebarOpen ? '260px' : '76px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#1b4332',
        borderRight: '1px solid #2d6a4f',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.06)'
      }}>
        {/* Header Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div>
              <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>PLANTO Admin</h3>
              <span style={{ fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>Super Operations</span>
            </div>
          ) : (
            <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 auto' }}>PA</span>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu (Expanded vertical height & clean spacing) */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {adminSidebarItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#2d6a4f' : 'transparent',
                  color: active ? '#ffffff' : '#d8f3dc',
                  fontWeight: active ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
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
                  <span style={{ background: '#ffb703', color: '#1b4332', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ADMIN SIDEBAR FOOTER */}
        <div style={{ padding: '18px 14px', borderTop: '1px solid #2d6a4f', background: 'rgba(0,0,0,0.15)', marginTop: 'auto', flexShrink: 0 }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffb703', color: '#1b4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                  SA
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Super Admin Console
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>
                    Root Controller
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsAdminLoggedIn(false)}
                style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Logout System
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAdminLoggedIn(false)} style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'block', margin: '0 auto' }}>
              Exit
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        
        {/* Page Top Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', background: '#ffffff', padding: '20px 28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
              {adminSidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
              PLANTO Platform Master Control Panel & Governance Operations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ background: '#e8f5e9', color: '#1b4332', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
              System Operational
            </span>
          </div>
        </div>

        {/* TAB 0: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ borderLeft: '5px solid #1b4332' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>TOTAL PLATFORM GMV</span>
                <h3 style={{ fontSize: '28px', color: '#1b4332', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>₹{totalGMV.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#2e7d32', marginTop: '6px', display: 'block', fontWeight: 700 }}>+24% growth this month</span>
              </div>
              <div className="card" style={{ borderLeft: '5px solid #0284c7' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>REGISTERED NURSERIES</span>
                <h3 style={{ fontSize: '28px', color: '#0284c7', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{vendors.length} Stalls</h3>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 700 }}>Verified Sellers</span>
              </div>
              <div className="card" style={{ borderLeft: '5px solid #d97706' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>ACTIVE RIDER FLEET</span>
                <h3 style={{ fontSize: '28px', color: '#d97706', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>{riders.length} Registered</h3>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 700 }}>{riders.filter(r => r.status === 'PENDING_APPROVAL').length} Pending Approvals</span>
              </div>
              <div className="card" style={{ borderLeft: '5px solid #8b5cf6' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>PLATFORM REVENUE (8%)</span>
                <h3 style={{ fontSize: '28px', color: '#8b5cf6', marginTop: '4px', margin: 0, fontFamily: 'var(--font-serif)' }}>₹{platformCommission.toLocaleString()}</h3>
                <span style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '6px', display: 'block', fontWeight: 700 }}>Net earnings</span>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginBottom: '12px', color: '#1b4332' }}>System Architecture & Micro-services</h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Unified Monorepo API running on Port 5002 • Customer Marketplace (Port 5173) • Business Portal (Port 5174) • Super Admin Console (Port 5175). All micro-services active and synchronized.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-serif)' }}>Platform Categories ({categories.length})</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>Manage product taxonomy across Plants, Planters, Fertilizers, Seeds & Bouquets</p>
              </div>
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}
              >
                + Add New Category
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {categories.map(cat => (
                <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ background: '#e8f5e9', color: '#1b4332', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                        {cat.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
                      {cat.name}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.5, minHeight: '38px' }}>
                      {cat.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                      {products.filter(p => p.category === cat.name).length || cat.itemCount} Listed Items
                    </span>
                    
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <DeleteIcon size={14} color="#dc2626" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VENDORS MANAGER */}
        {activeTab === 'vendors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-serif)' }}>Registered Nursery Stalls ({vendors.length})</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>Click on any nursery stall name or eye icon to inspect uploaded plants & pots</p>
              </div>
              <button 
                onClick={() => {
                  const newV = {
                    id: `v_${Date.now()}`,
                    name: "Green Horizon Nursery Stall",
                    owner: "Anand Kumar",
                    type: "Roadside Seller",
                    rating: 5.0,
                    isOpen: true,
                    phone: "+91 99880 11223",
                    address: "Outer Ring Road, Bengaluru"
                  };
                  setVendors([newV, ...vendors]);
                }}
                style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}
              >
                + Register New Nursery Stall
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Nursery Stall Name</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Owner</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Type</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Rating</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800, width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => {
                    const vendorItemCount = products.filter(p => p.vendorId === v.id || p.vendorName === v.name).length;
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div 
                            onClick={() => setSelectedVendorForCatalog(v)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view uploaded plants, pots & items"
                          >
                            <strong style={{ fontSize: '14.5px', color: '#1b4332', textDecoration: 'underline', display: 'block' }}>
                              {v.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                              {vendorItemCount} Uploaded Items • Tap to Inspect
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px', color: '#334155', fontWeight: 700 }}>{v.owner}</td>
                        <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>{v.type}</td>
                        <td style={{ padding: '16px 20px', color: '#d97706', fontWeight: 800 }}>⭐ {v.rating}</td>
                        
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            background: v.isOpen ? '#e8f5e9' : '#fef2f2', 
                            color: v.isOpen ? '#1b4332' : '#dc2626', 
                            border: v.isOpen ? '1px solid #c8e6c9' : '1px solid #fee2e2', 
                            padding: '6px 14px', 
                            borderRadius: '12px', 
                            fontSize: '11.5px', 
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                          }}>
                            {v.isOpen ? 'ACTIVE SELLER' : 'DISABLED'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              onClick={() => setSelectedVendorForCatalog(v)}
                              style={{ background: '#1b4332', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(27,67,50,0.2)' }}
                              title="View Catalog & Uploaded Items"
                            >
                              <ViewIcon size={17} color="#ffffff" />
                            </button>

                            <button 
                              onClick={() => handleOpenEditVendor(v)}
                              style={{ background: '#2d6a4f', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(45,106,79,0.2)' }}
                              title="Edit Nursery Stall Details"
                            >
                              <EditIcon size={17} color="#ffffff" />
                            </button>

                            <button 
                              onClick={() => handleToggleVendorApproval(v.id)}
                              style={{ background: v.isOpen ? '#d97706' : '#16a34a', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                              title={v.isOpen ? "Disable Nursery Stall" : "Enable Nursery Stall"}
                            >
                              {v.isOpen ? <DisableIcon size={17} color="#ffffff" /> : <EnableIcon size={17} color="#ffffff" />}
                            </button>

                            <button 
                              onClick={() => setDeletingVendor(v)}
                              style={{ background: '#dc2626', color: '#ffffff', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(220,38,38,0.2)' }}
                              title="Delete Nursery Stall"
                            >
                              <DeleteIcon size={17} color="#ffffff" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERY FLEET PARTNERS (VERIFICATION & ADMIN ADD RIDER) */}
        {activeTab === 'riders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-serif)' }}>
                  Delivery Fleet Verification Console ({riders.length})
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Verify Driving License, Aadhaar details, vehicle registration numbers, and issue rider credentials
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: '#fff8e1', color: '#b45309', border: '1px solid #ffe082', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                  {riders.filter(r => r.status === 'PENDING_APPROVAL').length} Pending Approvals
                </span>

                {/* Top-Right Corner "+ Register Delivery Partner" Button */}
                <button 
                  onClick={() => setShowAddRiderModal(true)}
                  style={{ background: '#1b4332', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(27,67,50,0.2)' }}
                >
                  + Register Delivery Partner
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8faf9', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Delivery Rider Details</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Vehicle & Reg No.</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Location Address</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>DL Number</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Aadhaar Number</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800, width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ fontSize: '14.5px', color: '#1b4332', display: 'block' }}>{r.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>{r.email} • {r.phone}</span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ fontSize: '13.5px', color: '#1b4332', display: 'block' }}>{r.vehicle || 'Hero Electric Scooter'}</strong>
                        <span style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 800, background: '#fff8e1', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '4px' }}>
                          Reg: {r.vehicleNumber || 'KA-05-EQ-8821'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', color: '#334155', fontSize: '13px', maxWidth: '200px' }}>{r.address}</td>
                      <td style={{ padding: '16px 20px', color: '#1b4332', fontWeight: 800, fontSize: '13px' }}>{r.drivingLicense}</td>
                      <td style={{ padding: '16px 20px', color: '#334155', fontSize: '13px', fontFamily: 'monospace' }}>{r.aadhaar}</td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          background: r.status === 'APPROVED' ? '#e8f5e9' : r.status === 'PENDING_APPROVAL' ? '#fff8e1' : '#fef2f2', 
                          color: r.status === 'APPROVED' ? '#1b4332' : r.status === 'PENDING_APPROVAL' ? '#b45309' : '#dc2626', 
                          border: r.status === 'APPROVED' ? '1px solid #c8e6c9' : r.status === 'PENDING_APPROVAL' ? '1px solid #ffe082' : '1px solid #fee2e2', 
                          padding: '6px 14px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          {r.status === 'APPROVED' ? 'APPROVED' : r.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : 'REJECTED'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          
                          {/* View Verification Documents Modal Button */}
                          <button 
                            onClick={() => setSelectedRiderForDocs(r)}
                            style={{ background: '#1b4332', color: '#fff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Inspect Driving License & Aadhaar Documents"
                          >
                            <ViewIcon size={16} color="#ffffff" />
                          </button>

                          {/* Approve Rider Button */}
                          {r.status !== 'APPROVED' && (
                            <button 
                              onClick={() => handleUpdateRiderApproval(r.id, 'APPROVED')}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Approve Rider Application & Enable Login"
                            >
                              <EnableIcon size={16} color="#ffffff" />
                            </button>
                          )}

                          {/* Reject Rider Button */}
                          {r.status !== 'REJECTED' && (
                            <button 
                              onClick={() => handleUpdateRiderApproval(r.id, 'REJECTED')}
                              style={{ background: '#dc2626', color: '#fff', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Reject Application"
                            >
                              <RejectIcon size={16} color="#ffffff" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS STREAM */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((o) => (
              <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '16px', color: '#1b4332' }}>Order #{o.id}</strong>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Date: {o.date} • Nursery: {o.vendorName || 'Sai Baba Stall'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332' }}>₹{o.total}</div>
                  <span style={{ fontSize: '11px', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Status: {o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginBottom: '16px', color: '#1b4332' }}>Platform Financial Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155' }}>
              <div><strong>Marketplace Commission:</strong> 8.0% per completed order</div>
              <div><strong>Nursery Delivery SLA:</strong> 30-45 minutes express</div>
              <div><strong>Delivery Rider Base Pay:</strong> ₹55 + ₹10 Plant Care Bonus</div>
            </div>
          </div>
        )}

      </main>

      {/* ADMIN ADD DELIVERY FLEET RIDER MODAL */}
      {showAddRiderModal && (
        <div className="modal-backdrop-animated" style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card modal-content-animated" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  + Register Delivery Partner
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Issue rider credentials directly from Super Admin Console
                </p>
              </div>

              <button onClick={() => setShowAddRiderModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleAdminRegisterRiderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Rider Full Name</label>
                  <input type="text" placeholder="e.g. Ramu Prasad" value={adminRiderName} onChange={(e) => setAdminRiderName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Email Address (Login ID)</label>
                  <input type="email" placeholder="rider@planto.in" value={adminRiderEmail} onChange={(e) => setAdminRiderEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Login Password</label>
                  <input type="text" value={adminRiderPassword} onChange={(e) => setAdminRiderPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                  <input type="tel" placeholder="+91 98450 11223" value={adminRiderPhone} onChange={(e) => setAdminRiderPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Location Address</label>
                <input type="text" placeholder="e.g. Indiranagar 100ft Road, Bengaluru" value={adminRiderAddress} onChange={(e) => setAdminRiderAddress(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Vehicle Model</label>
                  <input type="text" placeholder="e.g. Hero Electric Scooter" value={adminRiderVehicle} onChange={(e) => setAdminRiderVehicle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Vehicle Reg Number</label>
                  <input type="text" placeholder="e.g. KA-05-EQ-8821" value={adminRiderVehicleNum} onChange={(e) => setAdminRiderVehicleNum(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Driving License No.</label>
                  <input type="text" placeholder="KA-01-2023-0098412" value={adminRiderDlNum} onChange={(e) => setAdminRiderDlNum(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Aadhaar Card No.</label>
                  <input type="text" placeholder="4812-9901-3412" value={adminRiderAadhaarNum} onChange={(e) => setAdminRiderAadhaarNum(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Initial Account Approval Status</label>
                <select 
                  value={adminRiderStatus} 
                  onChange={(e) => setAdminRiderStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
                >
                  <option value="APPROVED">APPROVED (Enable Login Immediately)</option>
                  <option value="PENDING_APPROVAL">PENDING APPROVAL (Verification Required)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddRiderModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                  Issue Credentials & Save Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIDER DOCUMENT VERIFICATION MODAL (Supports Both PDF & Images) */}
      {selectedRiderForDocs && (
        <div className="modal-backdrop-animated" style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card modal-content-animated" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '680px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  {selectedRiderForDocs.name} - Document Audit
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Registered: {selectedRiderForDocs.registeredAt} • Email: {selectedRiderForDocs.email} • Phone: {selectedRiderForDocs.phone}
                </p>
              </div>

              <button onClick={() => setSelectedRiderForDocs(null)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8faf9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Vehicle Model & Registration</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', marginTop: '2px' }}>
                    {selectedRiderForDocs.vehicle || 'Hero Electric Scooter'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                    Reg: {selectedRiderForDocs.vehicleNumber || 'KA-05-EQ-8821'}
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Location Address</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {selectedRiderForDocs.address}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* DL Document (PDF or Image) */}
                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Driving License</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1b4332', marginTop: '2px', marginBottom: '10px' }}>
                    {selectedRiderForDocs.drivingLicense}
                  </div>
                  
                  {selectedRiderForDocs.dlFileType?.includes('pdf') || selectedRiderForDocs.dlFileName?.endsWith('.pdf') || selectedRiderForDocs.dlDoc?.startsWith('data:application/pdf') ? (
                    <div style={{ height: '140px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>PDF Document</span>
                      <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap' }}>
                        {selectedRiderForDocs.dlFileName || 'Driving_License.pdf'}
                      </span>
                      <button 
                        onClick={() => {
                          const win = window.open();
                          win?.document.write(`<iframe src="${selectedRiderForDocs.dlDoc}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Open PDF File
                      </button>
                    </div>
                  ) : (
                    <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0' }}>
                      <img src={selectedRiderForDocs.dlDoc} alt="Driving License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {/* Aadhaar Document (PDF or Image) */}
                <div style={{ background: '#f8faf9', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Aadhaar Card</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1b4332', marginTop: '2px', marginBottom: '10px', fontFamily: 'monospace' }}>
                    {selectedRiderForDocs.aadhaar}
                  </div>

                  {selectedRiderForDocs.aadhaarFileType?.includes('pdf') || selectedRiderForDocs.aadhaarFileName?.endsWith('.pdf') || selectedRiderForDocs.aadhaarDoc?.startsWith('data:application/pdf') ? (
                    <div style={{ height: '140px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>PDF Document</span>
                      <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap' }}>
                        {selectedRiderForDocs.aadhaarFileName || 'Aadhaar_Card.pdf'}
                      </span>
                      <button 
                        onClick={() => {
                          const win = window.open();
                          win?.document.write(`<iframe src="${selectedRiderForDocs.aadhaarDoc}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Open PDF File
                      </button>
                    </div>
                  ) : (
                    <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0' }}>
                      <img src={selectedRiderForDocs.aadhaarDoc} alt="Aadhaar Card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Current Status: </span>
                  <span style={{ 
                    background: selectedRiderForDocs.status === 'APPROVED' ? '#e8f5e9' : selectedRiderForDocs.status === 'PENDING_APPROVAL' ? '#fff8e1' : '#fef2f2', 
                    color: selectedRiderForDocs.status === 'APPROVED' ? '#1b4332' : selectedRiderForDocs.status === 'PENDING_APPROVAL' ? '#b45309' : '#dc2626', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '11.5px', 
                    fontWeight: 800 
                  }}>
                    {selectedRiderForDocs.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedRiderForDocs.status !== 'APPROVED' && (
                    <button 
                      onClick={() => handleUpdateRiderApproval(selectedRiderForDocs.id, 'APPROVED')}
                      style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Approve Delivery Partner
                    </button>
                  )}
                  {selectedRiderForDocs.status !== 'REJECTED' && (
                    <button 
                      onClick={() => handleUpdateRiderApproval(selectedRiderForDocs.id, 'REJECTED')}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VENDOR INVENTORY INSPECTOR MODAL */}
      {selectedVendorForCatalog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '940px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', color: '#1b4332' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', background: '#f8faf9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                  {selectedVendorForCatalog.name}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Owner: <strong>{selectedVendorForCatalog.owner}</strong> • Rating: ⭐ {selectedVendorForCatalog.rating} • Phone: {selectedVendorForCatalog.phone || '+91 98480 22334'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  + Add Product for this Nursery
                </button>
                <button 
                  onClick={() => setSelectedVendorForCatalog(null)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 800 }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1b4332' }}>
                Showing {filteredCatalogProducts.length} items uploaded by {selectedVendorForCatalog.name}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#1b4332' }}>Filter Category:</label>
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '2px solid #1b4332',
                    background: '#ffffff',
                    color: '#1b4332',
                    fontWeight: 800,
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(27,67,50,0.1)'
                  }}
                >
                  <option value="All">All Categories ({selectedVendorProducts.length})</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, background: '#f4f9f5' }}>
              {filteredCatalogProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '18px', color: '#1b4332', margin: 0, fontFamily: 'var(--font-serif)' }}>No items uploaded under '{inventoryCategoryFilter}' yet</h4>
                  <p style={{ fontSize: '13px', marginTop: '6px' }}>Click '+ Add Product for this Nursery' to upload plants, ceramic pots, seeds, or bouquets!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {filteredCatalogProducts.map(item => (
                    <div key={item.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '140px', background: '#f8faf9', marginBottom: '12px' }}>
                        <img src={getImageSrc(item)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#1b4332', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          {item.category}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', margin: 0, height: '38px', overflow: 'hidden', lineHeight: '1.3' }}>
                          {item.name}
                        </h4>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <strong style={{ fontSize: '17px', color: '#1b4332' }}>₹{item.price}</strong>
                          <span style={{ fontSize: '11px', color: '#2d6a4f', background: '#e8f5e9', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            Stock: <strong>{item.quantity}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>⭐ {item.rating || 4.8}</span>
                        <button 
                          onClick={() => handleDeleteProductFromAdmin(item.id)}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <DeleteIcon size={13} color="#dc2626" /> Remove Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', background: '#ffffff', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedVendorForCatalog(null)}
                style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {editingVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EditIcon size={20} color="#1b4332" /> Edit Nursery Stall Info
              </h3>
              <button onClick={() => setEditingVendor(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditVendor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Nursery Stall Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Owner / Manager Name</label>
                <input 
                  type="text" 
                  value={editOwner} 
                  onChange={(e) => setEditOwner(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Seller Category</label>
                  <select 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Roadside Seller">Roadside Seller</option>
                    <option value="Verified Vendor">Verified Vendor</option>
                    <option value="Pottery Specialist">Pottery Specialist</option>
                    <option value="Flower Florist">Flower Florist</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Rating (⭐)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="5"
                    value={editRating} 
                    onChange={(e) => setEditRating(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Phone Contact</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Stall Location Address</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingVendor(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Save Nursery Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE VENDOR MODAL */}
      {deletingVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '28px', color: '#1b4332', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <DeleteIcon size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: '0 0 8px 0', color: '#1b4332' }}>
              Delete Nursery Stall?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Are you sure you want to permanently delete <strong>{deletingVendor.name}</strong>? This action will also delete all associated plants, pots, and products from the platform.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeletingVendor(null)}
                style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeleteVendor}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT TO VENDOR MODAL */}
      {showAddProductModal && selectedVendorForCatalog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                + Upload Product for {selectedVendorForCatalog.name}
              </h3>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleAddProductToVendorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Product Title</label>
                <input 
                  type="text" 
                  value={newProdName} 
                  onChange={(e) => setNewProdName(e.target.value)} 
                  placeholder="e.g. Handmade Terracotta Planter 8-Inch"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category</label>
                  <select 
                    value={newProdCategory} 
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProdPrice} 
                    onChange={(e) => setNewProdPrice(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Initial Stock Quantity</label>
                <input 
                  type="number" 
                  value={newProdStock} 
                  onChange={(e) => setNewProdStock(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={newProdImg} 
                  onChange={(e) => setNewProdImg(e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Upload to Vendor Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,67,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', color: '#1b4332', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', margin: 0, color: '#1b4332' }}>
                Add New Marketplace Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category Name</label>
                <input 
                  type="text" 
                  value={catName} 
                  onChange={(e) => setCatName(e.target.value)} 
                  placeholder="e.g. Hydroponics & Vertical Farming"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Category Description</label>
                <textarea 
                  value={catDescription} 
                  onChange={(e) => setCatDescription(e.target.value)} 
                  placeholder="Describe items listed under this category..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddCategoryModal(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function ProfilePage() {
  const { 
    wishlist, 
    products, 
    wallet, 
    addWalletFunds,
    orders, 
    cart,
    logoutUser,
    isLoggedIn,
    currentUser,
    updateUserProfile,
    setShowLogin,
    setLoginPresetEmail,
    reminders,
    addReminder,
    deleteReminder,
    toggleReminderActive,
    addToCart,
    toggleWishlist
  } = useApp();

  const demoWishlistItems = [
    {
      id: "demo-p1",
      name: "Money Plant (Golden Pothos)",
      category: "Indoor Plant",
      price: 180,
      oldPrice: 220,
      discount: "18% OFF",
      img: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80",
      stockStatus: "In Stock"
    },
    {
      id: "demo-p2",
      name: "Succulent Jade Plant",
      category: "Succulent",
      price: 120,
      oldPrice: 150,
      discount: "20% OFF",
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
      stockStatus: "In Stock"
    },
    {
      id: "demo-p3",
      name: "Snake Plant (Sansevieria)",
      category: "Air Purifying Plant",
      price: 250,
      oldPrice: 300,
      discount: "17% OFF",
      img: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&w=400&q=80",
      stockStatus: "Low Stock"
    },
    {
      id: "demo-p4",
      name: "Marigold Flower Seeds",
      category: "Flower Seeds",
      price: 35,
      oldPrice: 45,
      discount: "22% OFF",
      img: "https://images.unsplash.com/photo-1588615419954-47c0fae39b21?auto=format&fit=crop&w=400&q=80",
      stockStatus: "In Stock"
    },
    {
      id: "demo-p5",
      name: "Terracotta Pot (6 inch)",
      category: "Pots & Planters",
      price: 80,
      oldPrice: 100,
      discount: "20% OFF",
      img: "https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=400&q=80",
      stockStatus: "In Stock"
    },
    {
      id: "demo-p6",
      name: "Premium Potting Mix (5kg)",
      category: "Soil & Fertilizers",
      price: 150,
      oldPrice: 180,
      discount: "16% OFF",
      img: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=400&q=80",
      stockStatus: "In Stock"
    }
  ];

  const [localWishlist, setLocalWishlist] = useState(demoWishlistItems);

  const handleRemoveLocalWishlist = (id) => {
    setLocalWishlist(prev => prev.filter(item => item.id !== id));
    // Toggle globally if in user's real wishlist context
    const realId = id.replace('demo-', '');
    if (wishlist.includes(realId)) {
      toggleWishlist(realId);
    }
  };

  const handleAddLocalToCart = (item) => {
    addToCart({
      id: item.id.replace('demo-', ''),
      name: item.name,
      price: item.price,
      img: item.img,
      category: item.category
    }, 1);
    alert(`${item.name} added to your shopping cart!`);
  };

  const handleMoveAllToCart = () => {
    if (localWishlist.length === 0) {
      alert("Your wishlist is empty.");
      return;
    }
    localWishlist.forEach(item => {
      addToCart({
        id: item.id.replace('demo-', ''),
        name: item.name,
        price: item.price,
        img: item.img,
        category: item.category
      }, 1);
    });
    alert("All items from your wishlist have been moved to your shopping cart!");
  };

  // Active tab state
  const [activeTab, setActiveTab] = useState(isLoggedIn && currentUser?.role === 'Customer' ? 'dashboard' : 'wishlist');
  
  // Sync activeTab when authentication status changes
  React.useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'Customer') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('wishlist');
    }
  }, [isLoggedIn, currentUser]);
  
  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || 'Suhas K.');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '+91 99001 12345');

  // Address states
  const [newAddress, setNewAddress] = useState('');
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [editingAddressText, setEditingAddressText] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Wallet simulation state
  const [addFundsSuccess, setAddFundsSuccess] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Reminders form state
  const [remName, setRemName] = useState('');
  const [remInterval, setRemInterval] = useState('Every 7 Days');

  // Gating access for Customers only
  const isCustomer = isLoggedIn && currentUser?.role === 'Customer';

  // Address helpers
  const userAddresses = currentUser?.addresses || [
    'Indiranagar Sector 3, Bengaluru, KA - 560038'
  ];
  const activeAddressIdx = currentUser?.activeAddressIdx || 0;

  const handleLogout = () => {
    logoutUser();
    window.location.hash = "#/";
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      phone: editPhone
    });
    setIsEditing(false);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const updatedAddresses = [...userAddresses, newAddress.trim()];
    updateUserProfile({
      addresses: updatedAddresses,
      activeAddressIdx: updatedAddresses.length - 1
    });
    setNewAddress('');
  };

  const handleSaveEditedAddress = (index) => {
    if (!editingAddressText.trim()) return;
    const updatedAddresses = [...userAddresses];
    updatedAddresses[index] = editingAddressText.trim();
    updateUserProfile({
      addresses: updatedAddresses
    });
    setEditingAddressIdx(null);
    setEditingAddressText('');
  };

  const handleDeleteAddress = (index) => {
    if (userAddresses.length <= 1) {
      alert("You must have at least one delivery address!");
      return;
    }
    const updatedAddresses = userAddresses.filter((_, i) => i !== index);
    let newActiveIdx = activeAddressIdx;
    if (activeAddressIdx >= updatedAddresses.length) {
      newActiveIdx = updatedAddresses.length - 1;
    }
    updateUserProfile({
      addresses: updatedAddresses,
      activeAddressIdx: newActiveIdx
    });
  };

  const handleSelectActiveAddress = (index) => {
    updateUserProfile({
      activeAddressIdx: index
    });
  };

  const handleAddFundsSimulate = async (amount) => {
    setIsAddingFunds(true);
    setAddFundsSuccess('');
    const res = await addWalletFunds(amount);
    setIsAddingFunds(false);
    if (res.success) {
      setAddFundsSuccess(`Successfully added ₹${amount} to your wallet!`);
      setTimeout(() => setAddFundsSuccess(''), 3000);
    } else {
      alert("Failed to add funds. Please try again.");
    }
  };

  const handleAddReminderSubmit = async (e) => {
    e.preventDefault();
    if (!remName.trim()) return;
    const nextDue = new Date();
    const days = remInterval.includes('15') ? 15 : remInterval.includes('30') ? 30 : 7;
    nextDue.setDate(nextDue.getDate() + days);
    await addReminder({
      name: remName,
      interval: remInterval,
      nextDue: nextDue.toISOString().split('T')[0]
    });
    setRemName('');
  };

  // Find wishlist products
  const favProducts = products.filter(p => wishlist.includes(p.id));

  // Determine active order
  const activeOrder = orders.find(o => o.status !== 'Delivered') || orders[0];

  // Helper for timeline progress bar
  const getTimelineProgress = (status) => {
    switch (status) {
      case 'Confirmed':
        return 50;
      case 'Picked Up':
      case 'On the Way':
        return 75;
      case 'Delivered':
        return 100;
      default:
        return 25;
    }
  };

  // Navigation items mapping
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'orders', label: 'My Orders', icon: '🛍️' },
    { id: 'track', label: 'Track Packages', icon: '🚚' },
    { id: 'wishlist', label: 'My Wishlist', icon: '❤️' },
    { id: 'addresses', label: 'My Addresses', icon: '📍' },
    { id: 'wallet', label: 'My Wallet', icon: '💳' },
    { id: 'reminders', label: 'Plant Care Reminders', icon: '🌿' },
    { id: 'reviews', label: 'My Reviews', icon: '⭐' },
    { id: 'coupons', label: 'My Coupons', icon: '🏷️' },
    { id: 'refer', label: 'Refer & Earn', icon: '👥' },
    { id: 'settings', label: 'Account Settings', icon: '⚙️' },
    { id: 'help', label: 'Help & Support', icon: '💬' }
  ];

  const renderProfileIcon = (name, strokeColor = 'currentColor', size = 15) => {
    const strokeWidth = 2.2;
    const style = { flexShrink: 0 };
    switch (name) {
      case 'dashboard':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'orders':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case 'track':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
      case 'wishlist':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      case 'addresses':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'wallet':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'reminders':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
          </svg>
        );
      case 'reviews':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'coupons':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        );
      case 'refer':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'settings':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'help':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'logout':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        );
      case 'search':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case 'crown':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          </svg>
        );
      case 'check':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'plant':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M2 22c1.25-5.83 5-10 10-10s8.75 4.17 10 10" />
            <path d="M12 2v10" />
            <path d="M12 6a4 4 0 0 0-4-4 4 4 0 0 0 4 4z" />
            <path d="M12 8a4 4 0 0 1 4-4 4 4 0 0 1-4 4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (!isLoggedIn || currentUser?.role !== 'Customer') {
      return item.id === 'wishlist' || item.id === 'help';
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#f8f9fa', fontFamily: 'var(--font-main)' }}>
      {/* 1. LEFT SIDEBAR */}
      <aside style={{ width: '250px', background: '#ffffff', borderRight: '1px solid #eef2f5', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          {/* Logo removed */}

          {/* Navigation links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredSidebarItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsEditing(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'var(--primary-green)' : 'transparent',
                    color: isActive ? '#ffffff' : '#4a5568',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#f7fafc';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {renderProfileIcon(item.id, isActive ? '#ffffff' : '#4a5568', 16)}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div style={{ marginTop: '30px' }}>
          {/* Logout button removed */}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '6px 12px', width: '380px' }}>
            {renderProfileIcon('search', '#a0aec0', 14)}
            <input 
              type="text" 
              placeholder="Search plants, seeds, soil, pots..." 
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
            />
          </div>


        </div>

        {/* Dynamic Tab Render Panels */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
            {/* Middle Grid: Welcome, Stats, Active Tracker, Recent Orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Welcome banner */}
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                padding: '24px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
              }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-green)', textTransform: 'uppercase' }}>Welcome back,</span>
                  <h2 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--dark)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {currentUser?.name}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#4a5568', marginTop: '6px' }}>Let's make your space greener today!</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Potted plants styling vector */}
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 11h10v4a5 5 0 0 1-10 0v-4z" fill="#f0fff4" />
                    <path d="M12 2v9" />
                    <path d="M12 6a3 3 0 0 0-3-3C7.5 3 6 4 6 6s2 3 3 3h3" />
                    <path d="M12 7a3 3 0 0 1 3-3c1.5 0 3 1 3 3s-2 3-3 3h-3" />
                    <path d="M5 11h14" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Stats Grid Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {/* Stat 1 */}
                <div onClick={() => setActiveTab('orders')} style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#e8f5e9', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderProfileIcon('orders', 'var(--primary-green)', 16)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Total Orders</span>
                  </div>
                  <strong style={{ fontSize: '24px', color: 'var(--dark)' }}>18</strong>
                  <span style={{ fontSize: '11px', color: 'var(--primary-green)', display: 'block', marginTop: '4px', fontWeight: 600 }}>View all orders &rarr;</span>
                </div>
                {/* Stat 2 */}
                <div onClick={() => setActiveTab('track')} style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#fffde7', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderProfileIcon('track', 'var(--accent-gold)', 16)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Orders in Transit</span>
                  </div>
                  <strong style={{ fontSize: '24px', color: 'var(--dark)' }}>2</strong>
                  <span style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginTop: '4px', fontWeight: 600 }}>Track now &rarr;</span>
                </div>
                {/* Stat 3 */}
                <div onClick={() => setActiveTab('wishlist')} style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#e3f2fd', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderProfileIcon('wishlist', '#1e88e5', 16)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Plants in Wishlist</span>
                  </div>
                  <strong style={{ fontSize: '24px', color: 'var(--dark)' }}>{wishlist.length}</strong>
                  <span style={{ fontSize: '11px', color: '#1e88e5', display: 'block', marginTop: '4px', fontWeight: 600 }}>View wishlist &rarr;</span>
                </div>
                {/* Stat 4 */}
                <div onClick={() => setActiveTab('wallet')} style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#f3e5f5', padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderProfileIcon('wallet', '#8e24aa', 16)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Wallet Balance</span>
                  </div>
                  <strong style={{ fontSize: '24px', color: 'var(--dark)' }}>₹{Math.round(wallet)}</strong>
                  <span style={{ fontSize: '11px', color: '#8e24aa', display: 'block', marginTop: '4px', fontWeight: 600 }}>Add money &rarr;</span>
                </div>
              </div>

              {/* Active Order Tracking Section */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderProfileIcon('track', 'var(--primary-green)', 16)} Active Order Tracking
                  </h3>
                  <span style={{ fontSize: '12px', color: '#718096' }}>Order ID: <strong style={{ color: 'var(--primary-green)' }}>{activeOrder?.id || 'ORD-9824'}</strong></span>
                </div>

                {/* Progress bar timeline */}
                <div style={{ position: 'relative', height: '65px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                  {/* Progress Line */}
                  <div style={{ position: 'absolute', top: '20px', left: '5%', width: '90%', height: '4px', background: '#e0e0e0', zIndex: 1 }} />
                  <div style={{ position: 'absolute', top: '20px', left: '5%', width: `${getTimelineProgress(activeOrder?.status)}%`, height: '4px', background: 'var(--primary-green)', zIndex: 2, transition: 'width 0.4s ease' }} />

                  {/* Nodes */}
                  <div style={{ zIndex: 3, textAlign: 'center' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, margin: '0 auto 8px auto', boxShadow: '0 0 0 4px #e8f5e9' }}>✓</div>
                    <span style={{ fontSize: '10px', fontWeight: 700, display: 'block' }}>Placed</span>
                    <span style={{ fontSize: '8px', color: '#a0aec0', display: 'block' }}>02 Aug, 10:30 AM</span>
                  </div>

                  <div style={{ zIndex: 3, textAlign: 'center' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: activeOrder?.status !== 'Pending' ? 'var(--primary-green)' : '#ccc', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, margin: '0 auto 8px auto', boxShadow: activeOrder?.status !== 'Pending' ? '0 0 0 4px #e8f5e9' : 'none' }}>
                      {activeOrder?.status !== 'Pending' ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, display: 'block', color: activeOrder?.status !== 'Pending' ? 'var(--dark)' : '#a0aec0' }}>Confirmed</span>
                    <span style={{ fontSize: '8px', color: '#a0aec0', display: 'block' }}>02 Aug, 11:15 AM</span>
                  </div>

                  <div style={{ zIndex: 3, textAlign: 'center' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: activeOrder?.status === 'Picked Up' || activeOrder?.status === 'On the Way' ? 'var(--primary-green)' : '#ccc', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', margin: '-2px auto 8px auto', boxShadow: activeOrder?.status === 'Picked Up' || activeOrder?.status === 'On the Way' ? '0 0 0 4px #e8f5e9' : 'none' }}>
                      {renderProfileIcon('track', 'white', 11)}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, display: 'block', color: activeOrder?.status === 'Picked Up' || activeOrder?.status === 'On the Way' ? 'var(--dark)' : '#a0aec0' }}>On the Way</span>
                    <span style={{ fontSize: '8px', color: '#a0aec0', display: 'block' }}>03 Aug, 09:20 AM</span>
                  </div>

                  <div style={{ zIndex: 3, textAlign: 'center' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: activeOrder?.status === 'Delivered' ? 'var(--primary-green)' : '#fff', border: '2px dashed #a0aec0', margin: '0 auto 8px auto' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, display: 'block', color: activeOrder?.status === 'Delivered' ? 'var(--dark)' : '#a0aec0' }}>Delivered</span>
                    <span style={{ fontSize: '8px', color: '#a0aec0', display: 'block' }}>Expected 04 Aug</span>
                  </div>
                </div>

                {/* Active Item Panel */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #edf2f7' }}>
                      {renderProfileIcon('plant', 'var(--primary-green)', 18)}
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', display: 'block' }}>{activeOrder?.items?.[0]?.name || 'Premium Golden Pothos (Money Plant)'}</strong>
                      <span style={{ fontSize: '11px', color: '#718096' }}>Qty: {activeOrder?.items?.[0]?.quantity || 1} • {activeOrder?.deliveryType || 'Door Delivery'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                      Out for Delivery
                    </span>
                    <button 
                      onClick={() => setActiveTab('track')}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '11.5px', borderRadius: '8px' }}
                    >
                      Track Live
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View All Orders &rarr;</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #edf2f7', color: '#718096', textAlign: 'left' }}>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Order ID</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Items</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 3).map((ord, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: '12px 0', fontWeight: 700 }}>{ord.id}</td>
                          <td style={{ padding: '12px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {renderProfileIcon('plant', 'var(--primary-green)', 14)}
                              <span>{ord.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 0', color: '#4a5568' }}>{ord.date}</td>
                          <td style={{ padding: '12px 0', fontWeight: 700 }}>₹{ord.total}</td>
                          <td style={{ padding: '12px 0' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              background: ord.status === 'Delivered' ? 'var(--light-green)' : '#fffde7',
                              color: ord.status === 'Delivered' ? 'var(--primary-green)' : 'var(--accent-gold)'
                            }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Free Delivery promo banner */}
              <div style={{
                background: 'linear-gradient(90deg, #1b5e20 0%, #2e7d32 100%)',
                padding: '20px 24px',
                borderRadius: '16px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {renderProfileIcon('track', '#ffffff', 22)}
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Free Delivery on orders above ₹999</h4>
                    <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: 0 }}>Shop more, Save more!</p>
                  </div>
                </div>
                <Link to="/" style={{ background: '#ffffff', color: 'var(--primary-green)', padding: '8px 18px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>Shop Now</Link>
              </div>

            </div>

            {/* Right Sidebar: Profile details, Benefits, Quick Actions, Help */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* User details card */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 12px auto' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
                    SK
                  </div>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark)' }}>{currentUser?.name}</h3>
                <span style={{ display: 'inline-block', fontSize: '10px', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>
                  {renderProfileIcon('crown', 'var(--primary-green)', 11)} Premium Member
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', textAlign: 'left', borderTop: '1px solid #f0f0f0', paddingTop: '14px', marginTop: '14px' }}>
                  <span style={{ color: '#718096', fontSize: '10px' }}>EMAIL ADDRESS</span>
                  <strong style={{ marginTop: '-6px' }}>{currentUser?.email}</strong>
                  
                  <span style={{ color: '#718096', fontSize: '10px', marginTop: '4px' }}>PHONE</span>
                  <strong style={{ marginTop: '-6px' }}>{currentUser?.phone || '+91 99001 12345'}</strong>
                  
                  <span style={{ color: '#718096', fontSize: '10px', marginTop: '4px' }}>MEMBER SINCE</span>
                  <strong style={{ marginTop: '-6px' }}>August 2026</strong>
                </div>
              </div>

              {/* Premium Member Benefits Card */}
              <div style={{
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                padding: '20px',
                borderRadius: '16px',
                color: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                  {renderProfileIcon('crown', 'white', 14)} Premium Member Benefits
                </h4>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                  <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{renderProfileIcon('check', '#fff', 12)} Free Delivery on All Orders</li>
                  <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{renderProfileIcon('check', '#fff', 12)} Exclusive Discounts & Offers</li>
                  <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{renderProfileIcon('check', '#fff', 12)} Priority Customer Support</li>
                </ul>

                <button style={{ width: '100%', background: 'white', color: 'var(--primary-green)', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  Explore Benefits
                </button>
              </div>

              {/* Quick Actions Grid */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark)', marginBottom: '12px' }}>Quick Actions</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button onClick={() => setActiveTab('track')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer' }}>
                    {renderProfileIcon('track', 'var(--primary-green)', 18)}
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>Track Order</span>
                  </button>
                  <button onClick={() => setActiveTab('wishlist')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer' }}>
                    {renderProfileIcon('wishlist', 'var(--primary-green)', 18)}
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>My Wishlist</span>
                  </button>
                  <button onClick={() => setActiveTab('addresses')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer' }}>
                    {renderProfileIcon('addresses', 'var(--primary-green)', 18)}
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>Addresses</span>
                  </button>
                  <button onClick={() => setActiveTab('coupons')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer' }}>
                    {renderProfileIcon('coupons', 'var(--primary-green)', 18)}
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>Coupons</span>
                  </button>
                  <button onClick={() => setActiveTab('reminders')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer' }}>
                    {renderProfileIcon('reminders', 'var(--primary-green)', 18)}
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>Plant Care</span>
                  </button>
                  <button onClick={() => setActiveTab('help')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer' }}>
                    {renderProfileIcon('help', 'var(--primary-green)', 18)}
                    <span style={{ fontSize: '9px', fontWeight: 600 }}>Help Center</span>
                  </button>
                </div>
              </div>

              {/* Need help card */}
              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Need Help?</h4>
                <p style={{ fontSize: '11px', color: '#718096', marginTop: '2px', marginBottom: '10px' }}>We're here for you!</p>
                <button 
                  onClick={() => setActiveTab('help')}
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '11px', padding: '8px', justifyContent: 'center', borderRadius: '8px' }}
                >
                  Contact Support
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Orders List */}
        {activeTab === 'orders' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              {renderProfileIcon('orders', 'var(--primary-green)', 18)} Purchase Ledger & Receipts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No orders placed yet.</div>
              ) : (
                orders.map((ord, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                      <span>Order {ord.id}</span>
                      <span style={{ color: ord.status === 'Delivered' ? 'var(--primary-green)' : 'var(--accent-gold)' }}>
                        {ord.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Date: {ord.date} • Delivery Mode: {ord.deliveryType} • Vendor: {ord.vendorName}
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '8px', background: '#fcfcfc', padding: '10px', borderRadius: '8px' }}>
                      <strong>Items:</strong> {ord.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px', textAlign: 'right' }}>
                      Paid Total: ₹{ord.total}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Track Package detailed */}
        {activeTab === 'track' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              🚚 Package Dispatch Tracker
            </h3>
            {activeOrder ? (
              <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 0' }}>
                <div style={{ background: 'var(--light-green)', padding: '20px', borderRadius: '12px', border: '1px solid var(--primary-green)', marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '16px', color: 'var(--primary-green)', marginBottom: '8px' }}>
                    Package is currently: <strong>{activeOrder.status}</strong>
                  </h4>
                  <p style={{ fontSize: '12px', color: '#333' }}>
                    Our delivery partner Ramu Prasad is driving your plants directly to Indiranagar Sector 3.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '30px' }}>
                  {/* Vertical timeline line */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', width: '2px', height: '80%', background: 'var(--primary-green)' }} />

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-25px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-green)' }} />
                    <strong style={{ fontSize: '13px' }}>Order Placed</strong>
                    <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>Aug 02, 10:30 AM - Wallet payment confirmed</span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-25px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: activeOrder.status !== 'Confirmed' && activeOrder.status !== 'Pending' ? 'var(--primary-green)' : '#ccc' }} />
                    <strong style={{ fontSize: '13px', color: activeOrder.status !== 'Confirmed' && activeOrder.status !== 'Pending' ? 'var(--dark)' : '#888' }}>Package Dispatched</strong>
                    <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>Aug 03, 09:20 AM - Handed to Ramu Prasad (Delivery Partner)</span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-25px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: activeOrder.status === 'Delivered' ? 'var(--primary-green)' : '#ccc' }} />
                    <strong style={{ fontSize: '13px', color: activeOrder.status === 'Delivered' ? 'var(--dark)' : '#888' }}>Package Delivered</strong>
                    <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>Expected Aug 04 - Secure drop-off at default address</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '30px' }}>No active packages to track right now.</div>
            )}
          </div>
        )}

        {/* Tab 4: Wishlist products */}
        {activeTab === 'wishlist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Title Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <span style={{ color: '#e53e3e' }}>❤️</span> My Wishlist
                </h2>
                <p style={{ fontSize: '13px', color: '#718096', marginTop: '4px', marginBottom: 0 }}>Your favorite plants and products, all in one place.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Wishlist share link copied to clipboard!");
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: '1px solid #cbd5e0',
                    background: '#ffffff',
                    color: '#4a5568',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
                >
                  📤 Share Wishlist
                </button>
                
                <button 
                  onClick={handleMoveAllToCart}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary-green)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  🛒 Move All to Cart
                </button>
              </div>
            </div>

            {/* Metrics Grid Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              
              {/* Metric 1 */}
              <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🎁</div>
                <div>
                  <strong style={{ fontSize: '18px', display: 'block', color: 'var(--dark)' }}>{localWishlist.length}</strong>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Saved Items</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🏷️</div>
                <div>
                  <strong style={{ fontSize: '18px', display: 'block', color: 'var(--dark)' }}>₹{localWishlist.reduce((sum, item) => sum + item.price, 0)}</strong>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Total Value</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🔔</div>
                <div>
                  <strong style={{ fontSize: '18px', display: 'block', color: 'var(--dark)' }}>2</strong>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Price Drops</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>📦</div>
                <div>
                  <strong style={{ fontSize: '18px', display: 'block', color: 'var(--dark)' }}>{localWishlist.filter(item => item.stockStatus === 'In Stock').length}</strong>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>In Stock</span>
                </div>
              </div>

            </div>

            {/* Wishlist Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '12px', marginTop: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--dark)' }}>{localWishlist.length} Items in Wishlist</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '12.5px', color: '#718096' }}>
                  Sort by: <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, outline: 'none' }}><option>Recently Added</option></select>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', fontSize: '12px' }}>Grid</button>
                  <button style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', fontSize: '12px', color: '#ccc' }}>List</button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {localWishlist.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px 0', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                  No plants added to your wishlist yet.
                </div>
              ) : (
                localWishlist.map(prod => (
                  <div key={prod.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    
                    {/* Top image section with absolute badges */}
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '140px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={prod.img} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      {/* Heart Icon top right */}
                      <button 
                        onClick={() => handleRemoveLocalWishlist(prod.id)}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                      >
                        <span style={{ fontSize: '12px', color: '#e53e3e' }}>❤️</span>
                      </button>

                      {/* Stock Badge top left */}
                      <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '9px', background: prod.stockStatus === 'In Stock' ? '#ebf8f2' : '#fffaf0', color: prod.stockStatus === 'In Stock' ? '#38a169' : '#dd6b20', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        {prod.stockStatus}
                      </span>
                    </div>

                    {/* Details section */}
                    <div style={{ marginTop: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '9.5px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{prod.category}</span>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark)', marginTop: '2px', height: '36px', overflow: 'hidden', lineHeight: '1.3' }}>{prod.name}</h4>
                      </div>

                      {/* Prices row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        <strong style={{ fontSize: '15px', color: 'var(--dark)' }}>₹{prod.price}</strong>
                        <span style={{ fontSize: '12px', color: '#a0aec0', textDecoration: 'line-through' }}>₹{prod.oldPrice}</span>
                        <span style={{ fontSize: '9.5px', color: '#38a169', background: '#ebf8f2', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{prod.discount}</span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
                      <button 
                        onClick={() => handleAddLocalToCart(prod)}
                        style={{ border: '1px solid var(--primary-green)', background: '#ffffff', color: 'var(--primary-green)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#e8f5e9'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                      >
                        🛒
                      </button>
                      <button 
                        onClick={() => handleAddLocalToCart(prod)}
                        style={{ flex: 1, background: 'var(--primary-green)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => alert("Options: Share this product item, or move to private vault.")}
                        style={{ border: '1px solid #e2e8f0', background: '#ffffff', color: '#718096', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        ⋮
                      </button>
                    </div>

                  </div>
                ))
              )}

              {/* Call to action Banner (spans remaining 2 grid spaces) */}
              <div style={{ gridColumn: 'span 2', background: '#f5fdf7', border: '2px dashed #c8e6c9', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>🪴</div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>Find more greenery you'll love!</h4>
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px', marginBottom: '16px', maxWidth: '280px' }}>Explore our bestsellers and new arrivals.</p>
                <Link 
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1px solid var(--primary-green)',
                    background: '#ffffff',
                    color: 'var(--primary-green)',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e8f5e9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  🧭 Explore Plants
                </Link>
              </div>

            </div>

            {/* Footer lock label */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#a0aec0', marginTop: '20px', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
              <span>🔒</span> <strong>Secure & Private</strong> Your wishlist is only visible to you.
            </div>

          </div>
        )}

        {/* Tab 5: Addresses manager */}
        {activeTab === 'addresses' && (
          <div style={{ maxWidth: '600px' }}>
            <div className="stall-hours-box">
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                📍 Manage Delivery Addresses
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {userAddresses.map((addr, idx) => {
                  const isActive = idx === activeAddressIdx;
                  const isEditingThis = idx === editingAddressIdx;

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        background: isActive ? 'var(--light-green)' : '#fcfcf9',
                        border: isActive ? '1px solid var(--primary-green)' : '1px solid rgba(0,0,0,0.05)',
                        padding: '12px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {isEditingThis ? (
                        <div>
                          <textarea 
                            rows="2" 
                            value={editingAddressText} 
                            onChange={(e) => setEditingAddressText(e.target.value)} 
                            style={{ width: '100%', padding: '8px', fontSize: '12.5px', border: '1px solid #ccc', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-main)' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <button className="btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleSaveEditedAddress(idx)}>Save</button>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setEditingAddressIdx(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <input 
                              type="radio" 
                              name="addr-radio" 
                              checked={isActive}
                              onChange={() => handleSelectActiveAddress(idx)}
                              style={{ marginTop: '4px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', lineHeight: '1.4', flex: 1, color: isActive ? 'var(--dark)' : '#555' }}>
                              {addr}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(0,0,0,0.02)', paddingTop: '6px' }}>
                            <button 
                              onClick={() => { setEditingAddressIdx(idx); setEditingAddressText(addr); }}
                              style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Edit Address
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(idx)}
                              style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Collapsible Address Entry Form */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                <div 
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--dark)', padding: '4px 0', width: 'fit-content' }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#7E57C2' }}>{showAddAddress ? '−' : '＋'}</span>
                  ADD NEW ADDRESS
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} style={{ marginTop: '8px' }}>
                    <textarea 
                      rows="2"
                      placeholder="Type new shipping address here..."
                      required
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-main)', marginBottom: '8px' }}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ width: '100%', fontSize: '11px', padding: '8px', justifyContent: 'center' }}>
                      Add Address & Set Default
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 6: Wallet Recharge detailed */}
        {activeTab === 'wallet' && (
          <div style={{ maxWidth: '480px' }}>
            <div className="stall-hours-box" style={{ background: 'linear-gradient(135deg, var(--light-green) 0%, rgba(255,255,255,0.9) 100%)', border: 'none' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--earth-brown)', marginBottom: '8px', fontWeight: 600 }}>PLANTO Wallet Ledger</h3>
              <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--primary-green)' }}>
                ₹{Math.round(wallet)}
              </div>
              <p style={{ fontSize: '12px', color: '#555', marginTop: '4px', marginBottom: '20px' }}>Recharge your secure digital balance to buy plants instantly from roadside vendors.</p>
              
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '8px' }}>
                  SECURE RECHARGE SIMULATION
                </span>
                
                {addFundsSuccess && (
                  <div style={{ fontSize: '11.5px', color: 'var(--primary-green)', marginBottom: '10px', fontWeight: 600 }}>
                    ✓ {addFundsSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button disabled={isAddingFunds} onClick={() => handleAddFundsSimulate(200)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '11px', justifyContent: 'center', background: '#fff' }}>+ ₹200</button>
                  <button disabled={isAddingFunds} onClick={() => handleAddFundsSimulate(500)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '11px', justifyContent: 'center', background: '#fff' }}>+ ₹500</button>
                  <button disabled={isAddingFunds} onClick={() => handleAddFundsSimulate(1000)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '11px', justifyContent: 'center', background: '#fff' }}>+ ₹1000</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Care Reminders Panel */}
        {activeTab === 'reminders' && (
          <div style={{ maxWidth: '600px' }}>
            <div className="stall-hours-box" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                📅 Scheduled Plant Watering & Care
              </h3>
              
              <form onSubmit={handleAddReminderSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="E.g., Water Snake Plant..." 
                  required
                  value={remName}
                  onChange={(e) => setRemName(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '8px', outline: 'none' }}
                />
                <select 
                  value={remInterval} 
                  onChange={(e) => setRemInterval(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                >
                  <option>Every 3 Days</option>
                  <option>Every 7 Days</option>
                  <option>Every 15 Days</option>
                  <option>Every 30 Days</option>
                </select>
                <button type="submit" className="btn" style={{ padding: '8px 16px', fontSize: '12px' }}>+ Add</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reminders.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No reminders scheduled. Keep your plants hydrated!</div>
                ) : (
                  reminders.map(rem => (
                    <div 
                      key={rem.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: '#fcfcfc', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(0,0,0,0.03)' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          checked={!rem.active}
                          onChange={(e) => toggleReminderActive(rem.id, !e.target.checked)} 
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '14px', textDecoration: !rem.active ? 'line-through' : 'none', color: !rem.active ? '#888' : 'var(--dark)' }}>
                            {rem.name}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>Frequency: {rem.interval} • Next: {rem.nextDue}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteReminder(rem.id)}
                        style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Reviews placeholder */}
        {activeTab === 'reviews' && (
          <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>⭐ My Reviews</h3>
            <p style={{ fontSize: '13px', color: '#666' }}>You have not written any vendor reviews yet. Scan vendor QRs to purchase plants and review them!</p>
          </div>
        )}

        {/* Tab 9: Coupons placeholder */}
        {activeTab === 'coupons' && (
          <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>🏷️ My Coupons</h3>
            <p style={{ fontSize: '13px', color: '#666' }}>No active discount coupons at this time. Keep checkouts high to win coins and unlock stall discount vouchers!</p>
          </div>
        )}

        {/* Tab 10: Refer placeholder */}
        {activeTab === 'refer' && (
          <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>👥 Refer & Earn</h3>
            <p style={{ fontSize: '13px', color: '#666' }}>Share the green life! Invite a plant vendor to sign up on Planto and earn 100 wallet coins when they register their stall.</p>
          </div>
        )}

        {/* Tab 11: Settings */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '480px' }}>
            <div className="stall-hours-box">
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                ⚙️ Account Settings
              </h3>
              
              <form onSubmit={handleSaveProfile}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#718096', fontWeight: 600, display: 'block', marginBottom: '6px' }}>FULL NAME</label>
                  <input 
                    type="text" 
                    required 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    style={{ padding: '8px 12px', fontSize: '13px', width: '100%', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#718096', fontWeight: 600, display: 'block', marginBottom: '6px' }}>PHONE NUMBER</label>
                  <input 
                    type="text" 
                    required 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)} 
                    style={{ padding: '8px 12px', fontSize: '13px', width: '100%', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', padding: '10px', fontSize: '13px', justifyContent: 'center' }}>
                  Save Profile Details
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 12: Help placeholder */}
        {activeTab === 'help' && (
          <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>💬 Help & Support</h3>
            <p style={{ fontSize: '13px', color: '#666' }}>Got questions? Email us directly at **support@planto.in** or tap our AI diagnostician for help with plant health conditions.</p>
          </div>
        )}

      </div>
    </div>
  );
}

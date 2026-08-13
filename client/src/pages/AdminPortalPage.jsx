import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function AdminPortalPage() {
  const { 
    vendors, 
    loadAllData,
    isLoggedIn,
    currentUser,
    setShowLogin,
    setLoginPresetEmail,
    logoutUser
  } = useApp();

  const handleLogout = () => {
    logoutUser();
    window.location.hash = "#/";
  };

  const isAdmin = isLoggedIn && currentUser?.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="page-view active" style={{ display: 'block', padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '80px auto' }}>
        <div style={{ background: 'var(--white)', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'float 4s infinite' }}>⚙️</div>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '12px', color: 'var(--dark)' }}>Admin Console Restricted</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
            PLANTO Central Command Admin privileges are required to access this dashboard. Please sign in with an Admin account.
          </p>
          <button 
            className="btn" 
            style={{ width: '100%', justifyContent: 'center', height: '46px', borderRadius: '10px' }} 
            onClick={() => {
              setLoginPresetEmail('admin@planto.in');
              setShowLogin(true);
            }}
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: "reg-882", name: "Greenland Organic Nursery", owner: "Manjunath Gowda", location: "Kanakapura Road, Bangalore", type: "Nursery Stall" }
  ]);

  const [activeMenuId, setActiveMenuId] = useState('dashboard');

  const handleApprove = async (approved, index) => {
    try {
      const newVendor = {
        id: `v${Date.now()}`,
        name: approved.name,
        owner: approved.owner,
        type: "Roadside Seller",
        distance: "2.1 km",
        rating: 5.0,
        reviewsCount: 1,
        isOpen: true,
        phone: "+91 99887 76655",
        hours: "8:00 AM - 8:00 PM",
        coords: { x: 50, y: 50 },
        lat: 12.9600,
        lng: 77.6200,
        address: approved.location,
        googleMapsUrl: "https://maps.google.com",
        photos: ["https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=600&q=80"],
        reviews: []
      };

      // Call API
      await api.addVendor(newVendor);
      
      // Update UI
      setPendingApprovals(prev => prev.filter((_, i) => i !== index));
      alert(`${approved.name} is now approved and added as an active roadside seller stall!`);
      
      // Reload context data to show on home/maps
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to approve vendor.");
    }
  };

  const handleDecline = (approved, index) => {
    setPendingApprovals(prev => prev.filter((_, i) => i !== index));
    alert(`Registration for ${approved.name} declined.`);
  };

  // Mock platforms details
  const totalActiveSellers = vendors.length + 137; // dynamic base
  const grossMerchandiseValue = "₹2,84,900";
  const platformCommission = "₹8,547";

  const sidebarSections = [
    {
      title: "USER & VENDOR MANAGEMENT",
      items: [
        { id: "sellers", label: "Sellers", icon: "👥" },
        { id: "approvals", label: "Vendor Approvals", icon: "📝", badge: pendingApprovals.length },
        { id: "customers", label: "Customers", icon: "👤" },
        { id: "delivery", label: "Delivery Partners", icon: "🛵" }
      ]
    },
    {
      title: "PRODUCT & INVENTORY",
      items: [
        { id: "categories", label: "Categories", icon: "📁" },
        { id: "products", label: "Products", icon: "📦" },
        { id: "stock", label: "Stock Overview", icon: "📈" },
        { id: "bulk", label: "Bulk Upload", icon: "📤" }
      ]
    },
    {
      title: "ORDERS & OPERATIONS",
      items: [
        { id: "orders", label: "Orders", icon: "🛍️" },
        { id: "tracking", label: "Delivery Tracking", icon: "🚚" },
        { id: "returns", label: "Returns & Refunds", icon: "🔄" }
      ]
    },
    {
      title: "PLATFORM MANAGEMENT",
      items: [
        { id: "commissions", label: "Commissions", icon: "💵" },
        { id: "payments", label: "Payments & Payouts", icon: "💳" },
        { id: "coupons", label: "Coupons & Offers", icon: "🏷️" },
        { id: "settings", label: "Platform Settings", icon: "⚙️" }
      ]
    },
    {
      title: "ANALYTICS & REPORTS",
      items: [
        { id: "analytics", label: "Analytics", icon: "📊" },
        { id: "reports", label: "Reports", icon: "📋" },
        { id: "heatmap", label: "Demand Heatmap", icon: "🗺️", badge: "New" }
      ]
    }
  ];

  const renderSidebarIcon = (id) => {
    const strokeWidth = 2.2;
    const style = { flexShrink: 0, marginRight: '4px' };
    switch (id) {
      case 'dashboard':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case 'sellers':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'approvals':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'customers':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'delivery':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
            <path d="M3 17.5L6 8.5h6l3 4.5h6v4.5" />
          </svg>
        );
      case 'categories':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'products':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case 'stock':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        );
      case 'bulk':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.5-2-2.4-3.5-4.4-3.5h-1.2C15.6 4.8 12.8 3 9.5 3 5.4 3 2 6.4 2 10.5c0 .5 0 1 .1 1.5C.8 13 0 14.3 0 15.8 0 18 1.8 19.8 4 19.8h15c1.2 0 2.2-1 2.2-2.2v-2.6z" />
            <polyline points="16 12 12 8 8 12" />
            <line x1="12" y1="8" x2="12" y2="17" />
          </svg>
        );
      case 'orders':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case 'tracking':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
      case 'returns':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        );
      case 'commissions':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <line x1="6" y1="12" x2="6.01" y2="12" />
            <line x1="18" y1="12" x2="18.01" y2="12" />
          </svg>
        );
      case 'payments':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'coupons':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'analytics':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
        );
      case 'reports':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        );
      case 'heatmap':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        );
      case 'logout':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '8px' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderDashboardIcon = (name, strokeColor = 'currentColor') => {
    const strokeWidth = 2.2;
    const style = { flexShrink: 0 };
    switch (name) {
      case 'active-sellers':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'gmv':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'pending':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'commission':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        );
      case 'pin':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'celebration':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'activity-user':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'activity-box':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" rx="1" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        );
      case 'activity-card':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'activity-leaf':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
          </svg>
        );
      case 'quick-user':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        );
      case 'quick-box':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case 'quick-bag':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case 'quick-map':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        );
      case 'quick-chart':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#f8f9fa', fontFamily: 'var(--font-main)' }}>
      {/* 1. LEFT SIDEBAR */}
      <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #eef2f5', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>


          {/* Navigation Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Dashboard Button */}
            <button
              onClick={() => setActiveMenuId('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeMenuId === 'dashboard' ? 'var(--primary-green)' : 'transparent',
                color: activeMenuId === 'dashboard' ? '#ffffff' : '#4a5568',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              {renderSidebarIcon('dashboard')} Dashboard
            </button>

            {sidebarSections.map((section, idx) => (
              <div key={idx}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', paddingLeft: '14px', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  {section.title}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map(item => {
                    const isActive = activeMenuId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenuId(item.id);
                          if (item.id === 'approvals') {
                            // Quick alert/action mapping
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isActive ? 'var(--primary-green)' : 'transparent',
                          color: isActive ? '#ffffff' : '#4a5568',
                          fontSize: '12.5px',
                          fontWeight: isActive ? 600 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = '#f7fafc'; }}
                        onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {renderSidebarIcon(item.id)}
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge !== 0 && (
                          <span style={{
                            fontSize: '9px',
                            background: item.badge === 'New' ? '#38a169' : '#e53e3e',
                            color: '#ffffff',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 700
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom Logout removed */}
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        {/* Top Header Command Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12.5px', color: '#718096', fontWeight: 600 }}>Welcome back,</span>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              PLANTO Central Admin 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </h2>
            <p style={{ fontSize: '12.5px', color: '#718096', marginTop: '2px' }}>Monitor, manage & grow the PLANTO ecosystem.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Search Input bar */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '6px 12px', width: '300px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Search anything..." 
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12px' }}
              />
              <span style={{ fontSize: '10px', background: '#edf2f7', color: '#718096', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>ctrl + k</span>
            </div>



            {/* Generate Report Dropdown button */}
            <button 
              onClick={() => setActiveMenuId('reports')}
              style={{ background: 'var(--primary-green)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Generate Report ▾
            </button>
          </div>
        </div>

        {/* Dynamic Page Views: Fallback simple tables if not Dashboard */}
        {activeMenuId !== 'dashboard' ? (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '8px', textTransform: 'capitalize', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {activeMenuId} Management Panel
            </h3>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
              Platform management controls for <strong>{activeMenuId}</strong> are active. Local database updates sync securely with index nodes.
            </p>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Filter</button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Export</button>
                </div>
                {activeMenuId === 'products' && (
                  <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>+ Add New</button>
                )}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7', color: '#718096' }}>
                    <th style={{ padding: '12px', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Name / Title</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Date Modified</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((item) => (
                    <tr key={item} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '12px', color: '#4a5568' }}>#{activeMenuId.substring(0,3).toUpperCase()}-10{item}</td>
                      <td style={{ padding: '12px', color: 'var(--dark)', fontWeight: 500 }}>Sample {activeMenuId} Data {item}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Active</span>
                      </td>
                      <td style={{ padding: '12px', color: '#718096' }}>2026-08-12</td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#3182ce', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activeMenuId === 'approvals' && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px' }}>
                  Please return to the main Dashboard to review and action pending approvals.
                </div>
              )}
            </div>
            <button onClick={() => setActiveMenuId('dashboard')} style={{ marginTop: '24px', background: 'var(--primary-green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              &larr; Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* 3. FOUR STATS CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              
              {/* Stat 1: Total Active Sellers */}
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>{renderDashboardIcon('active-sellers', 'var(--primary-green)')}</div>
                    <span style={{ fontSize: '11.5px', color: '#718096', fontWeight: 600 }}>Active Sellers</span>
                  </div>
                  <strong style={{ fontSize: '20px', color: 'var(--dark)' }}>{totalActiveSellers}</strong>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--primary-green)', marginTop: '2px', fontWeight: 600 }}>↑ 18%</span>
                </div>
                {/* Mini chart SVG */}
                <svg width="45" height="18" viewBox="0 0 60 24" fill="none" stroke="var(--primary-green)" strokeWidth="2.5">
                  <path d="M 0,22 Q 12,8 24,18 T 48,6 T 60,10" />
                </svg>
              </div>

              {/* Stat 2: GMV */}
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>{renderDashboardIcon('gmv', 'var(--primary-green)')}</div>
                    <span style={{ fontSize: '11.5px', color: '#718096', fontWeight: 600 }}>GMV</span>
                  </div>
                  <strong style={{ fontSize: '20px', color: 'var(--dark)' }}>{grossMerchandiseValue}</strong>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--primary-green)', marginTop: '2px', fontWeight: 600 }}>↑ 22%</span>
                </div>
                {/* Mini chart SVG */}
                <svg width="45" height="18" viewBox="0 0 60 24" fill="none" stroke="var(--primary-green)" strokeWidth="2.5">
                  <path d="M 0,20 Q 15,10 30,16 T 60,4" />
                </svg>
              </div>

              {/* Stat 3: Pending Approvals */}
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53e3e' }}>{renderDashboardIcon('pending', '#e53e3e')}</div>
                    <span style={{ fontSize: '11.5px', color: '#718096', fontWeight: 600 }}>Pending Approvals</span>
                  </div>
                  <strong style={{ fontSize: '20px', color: 'var(--dark)' }}>{pendingApprovals.length}</strong>
                  <span style={{ display: 'block', fontSize: '10px', color: '#e53e3e', marginTop: '2px', fontWeight: 700 }}>Needs action</span>
                </div>
                {/* Mini chart SVG */}
                <svg width="45" height="18" viewBox="0 0 60 24" fill="none" stroke="#e53e3e" strokeWidth="2.5">
                  <path d="M 0,10 Q 15,18 30,12 T 60,20" />
                </svg>
              </div>

              {/* Stat 4: Commissions */}
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e24aa' }}>{renderDashboardIcon('commission', '#8e24aa')}</div>
                    <span style={{ fontSize: '11.5px', color: '#718096', fontWeight: 600 }}>Commission</span>
                  </div>
                  <strong style={{ fontSize: '20px', color: 'var(--dark)' }}>{platformCommission}</strong>
                  <span style={{ display: 'block', fontSize: '10px', color: '#8e24aa', marginTop: '2px', fontWeight: 600 }}>↑ 15%</span>
                </div>
                {/* Mini chart SVG */}
                <svg width="45" height="18" viewBox="0 0 60 24" fill="none" stroke="#8e24aa" strokeWidth="2.5">
                  <path d="M 0,22 Q 15,18 30,10 T 60,6" />
                </svg>
              </div>

            </div>

            {/* 4. MIDDLE ROW: Pending Registrations & Hotspots */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Card A: Pending Registrations */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>Pending Vendor Registrations</h3>
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px', marginBottom: '20px' }}>Review and approve new seller applications</p>

                <div id="admin-pending-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingApprovals.length === 0 ? (
                    <div style={{ padding: '40px 20px', borderRadius: '12px', border: '2px dashed #e2e8f0', textAlign: 'center', color: '#a0aec0', background: '#fafbfc' }}>
                      <div style={{ color: 'var(--primary-green)', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        {renderDashboardIcon('celebration', 'var(--primary-green)')}
                      </div>
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--dark)' }}>All caught up!</strong>
                      <span style={{ fontSize: '11.5px', display: 'block', marginTop: '2px' }}>No pending vendor registrations to approve.</span>
                    </div>
                  ) : (
                    pendingApprovals.map((approved, idx) => (
                      <div 
                        key={approved.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid #edf2f7',
                          padding: '16px',
                          borderRadius: '14px',
                          flexWrap: 'wrap',
                          gap: '16px',
                          background: '#fff'
                        }}
                      >
                        {/* Stall details column */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <img 
                            src="https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=120&h=120&q=80" 
                            alt={approved.name} 
                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} 
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>{approved.name}</h4>
                              <span style={{ fontSize: '9px', background: '#ebf8f2', color: '#38a169', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>New</span>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#718096', margin: '4px 0 0 0' }}>Owner: {approved.owner} • Location: {approved.location}</p>
                            <p style={{ fontSize: '10px', color: '#a0aec0', margin: '4px 0 0 0' }}>Applied on: 17 May 2026, 10:30 AM</p>
                            <span style={{ display: 'inline-block', fontSize: '9.5px', background: '#f0f4f1', color: 'var(--primary-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, marginTop: '8px' }}>
                              Type: {approved.type}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn admin-approve-btn" 
                            onClick={() => handleApprove(approved, idx)}
                            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', background: 'var(--primary-green)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            ✓ Approve Stall
                          </button>
                          <button 
                            className="btn btn-secondary admin-reject-btn" 
                            onClick={() => handleDecline(approved, idx)}
                            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', border: '1px solid #e53e3e', background: 'white', color: '#e53e3e', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                  <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveMenuId('approvals'); }} style={{ fontSize: '12.5px', color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>
                    View all pending approvals &rarr;
                  </a>
                </div>
              </div>

              {/* Card B: Hotspot Demand Areas */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>Hotspot Demand Areas</h3>
                  <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveMenuId('heatmap'); }} style={{ fontSize: '11.5px', color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>View All</a>
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '20px' }}>Real-time demand based on user searches</p>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                  {/* Locations list */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderDashboardIcon('pin', 'var(--primary-green)')}
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Indiranagar Sec 3</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#38a169', fontWeight: 700 }}>High (88)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderDashboardIcon('pin', 'var(--primary-green)')}
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Jayanagar Block 4</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#38a169', fontWeight: 700 }}>High (72)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderDashboardIcon('pin', 'var(--primary-green)')}
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Whitefield Corridor</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#dd6b20', fontWeight: 700 }}>Medium (45)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderDashboardIcon('pin', 'var(--primary-green)')}
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Electronic City P1</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#dd6b20', fontWeight: 700 }}>Medium (38)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderDashboardIcon('pin', 'var(--primary-green)')}
                        <span style={{ fontSize: '12.5px', fontWeight: 600 }}>HSR Layout Sec 6</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#3182ce', fontWeight: 700 }}>Low (21)</span>
                    </div>
                  </div>

                  {/* Heatmap Mini Graphics */}
                  <div style={{ width: '100px', height: '130px', background: '#edf7ed', borderRadius: '12px', position: 'relative', overflow: 'hidden', flexShrink: 0, border: '1px solid #c8e6c9' }}>
                    <div style={{ position: 'absolute', top: '20px', left: '30px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.4)', animation: 'float 4s infinite' }} />
                    <div style={{ position: 'absolute', top: '60px', left: '20px', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255, 152, 0, 0.3)' }} />
                    <div style={{ position: 'absolute', top: '40px', left: '60px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(33, 150, 243, 0.4)' }} />
                    <span style={{ position: 'absolute', bottom: '8px', width: '100%', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--primary-green)' }}>LIVE RADAR</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 5. CHARTS LOWER ROW: Platform Overview, Categories & Activity feed */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Column 1: Platform Overview double-line chart */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>Platform Overview</h3>
                  <select style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                {/* SVG double line chart */}
                <div style={{ position: 'relative', height: '140px', background: '#fafafa', borderRadius: '10px', padding: '10px', border: '1px solid #edf2f7' }}>
                  <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                    {/* Gridlines */}
                    <line x1="0" y1="20" x2="200" y2="20" stroke="#f0f0f0" strokeWidth="1" />
                    <line x1="0" y1="50" x2="200" y2="50" stroke="#f0f0f0" strokeWidth="1" />
                    <line x1="0" y1="80" x2="200" y2="80" stroke="#f0f0f0" strokeWidth="1" />
                    
                    {/* GMV Line (green) */}
                    <path d="M 0,70 L 30,60 L 60,75 L 90,65 L 120,50 L 150,40 L 180,48 L 200,35" fill="none" stroke="var(--primary-green)" strokeWidth="2.5" />
                    {/* Orders Line (blue) */}
                    <path d="M 0,90 L 30,78 L 60,82 L 90,80 L 120,68 L 150,55 L 180,62 L 200,50" fill="none" stroke="#2b6cb0" strokeWidth="1.5" strokeDasharray="3,3" />
                  </svg>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '16px', textAlign: 'center', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#a0aec0', display: 'block' }}>Total Orders</span>
                    <strong style={{ fontSize: '12px', display: 'block', color: 'var(--dark)' }}>568 <span style={{ color: 'var(--primary-green)', fontSize: '9px' }}>↑14%</span></strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#a0aec0', display: 'block' }}>New Cust</span>
                    <strong style={{ fontSize: '12px', display: 'block', color: 'var(--dark)' }}>386 <span style={{ color: 'var(--primary-green)', fontSize: '9px' }}>↑12%</span></strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#a0aec0', display: 'block' }}>Cancelled</span>
                    <strong style={{ fontSize: '12px', display: 'block', color: 'var(--dark)' }}>27 <span style={{ color: '#e53e3e', fontSize: '9px' }}>↓6%</span></strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#a0aec0', display: 'block' }}>Returns</span>
                    <strong style={{ fontSize: '12px', display: 'block', color: 'var(--dark)' }}>18 <span style={{ color: 'var(--primary-green)', fontSize: '9px' }}>↑3%</span></strong>
                  </div>
                </div>
              </div>

              {/* Column 2: Top Selling Categories donut chart */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>Top Selling Categories</h3>
                  <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveMenuId('categories'); }} style={{ fontSize: '11.5px', color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>View All</a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Conic donut chart rendering */}
                  <div style={{ 
                    position: 'relative', 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%', 
                    background: 'conic-gradient(var(--primary-green) 0% 35%, #3182ce 35% 57%, #ecc94b 57% 75%, #dd6b20 75% 87%, #805ad5 87% 95%, #cbd5e0 95% 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#a0aec0' }}>Sales</span>
                      <strong style={{ fontSize: '12px', color: 'var(--dark)', marginTop: '-2px' }}>2,847</strong>
                    </div>
                  </div>

                  {/* Legend lists */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-green)' }} />
                        Indoor Plants
                      </span>
                      <strong>35%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3182ce' }} />
                        Pots & Planters
                      </span>
                      <strong>22%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ecc94b' }} />
                        Seeds
                      </span>
                      <strong>18%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dd6b20' }} />
                        Soil & Mix
                      </span>
                      <strong>12%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#805ad5' }} />
                        Fertilizers
                      </span>
                      <strong>8%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Recent Platform Activities feed */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)', marginBottom: '14px' }}>Recent Platform Activities</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '155px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                    <span style={{ display: 'inline-flex', background: '#edf2f7', padding: '6px', borderRadius: '6px', color: '#718096' }}>{renderDashboardIcon('activity-user', '#718096')}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '11px', color: 'var(--dark)', margin: 0 }}>New seller "Greenland Organic Nursery" registration submitted</p>
                      <span style={{ fontSize: '9px', color: '#a0aec0' }}>10:30 AM</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                    <span style={{ display: 'inline-flex', background: '#edf2f7', padding: '6px', borderRadius: '6px', color: '#718096' }}>{renderDashboardIcon('activity-box', '#718096')}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '11px', color: 'var(--dark)', margin: 0 }}>Order #ORD-10245 delivered. Customer: Ramesh Kumar</p>
                      <span style={{ fontSize: '9px', color: '#a0aec0' }}>09:45 AM</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                    <span style={{ display: 'inline-flex', background: '#edf2f7', padding: '6px', borderRadius: '6px', color: '#718096' }}>{renderDashboardIcon('activity-card', '#718096')}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '11px', color: 'var(--dark)', margin: 0 }}>Payout of ₹24,560 to 12 sellers completed successfully</p>
                      <span style={{ fontSize: '9px', color: '#a0aec0' }}>09:15 AM</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', background: '#edf2f7', padding: '6px', borderRadius: '6px', color: '#718096' }}>{renderDashboardIcon('activity-leaf', '#718096')}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '11px', color: 'var(--dark)', margin: 0 }}>New product added by "Sai Baba Plant Stall": Money Plant Golden</p>
                      <span style={{ fontSize: '9px', color: '#a0aec0' }}>08:30 AM</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 6. BOTTOM ROW: Quick Actions */}
            <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark)', marginBottom: '14px' }}>Quick Actions</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <button onClick={() => setActiveMenuId('approvals')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#edf2f7'}>
                  <span style={{ display: 'inline-flex', background: '#ebf8f2', padding: '8px', borderRadius: '8px', color: 'var(--primary-green)' }}>{renderDashboardIcon('quick-user', 'var(--primary-green)')}</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', display: 'block', color: 'var(--dark)' }}>Approve Vendors</strong>
                    <span style={{ fontSize: '9.5px', color: '#a0aec0', display: 'block' }}>Review pending applications</span>
                  </div>
                </button>

                <button onClick={() => setActiveMenuId('products')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#edf2f7'}>
                  <span style={{ display: 'inline-flex', background: '#ebf8f2', padding: '8px', borderRadius: '8px', color: 'var(--primary-green)' }}>{renderDashboardIcon('quick-box', 'var(--primary-green)')}</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', display: 'block', color: 'var(--dark)' }}>Manage Products</strong>
                    <span style={{ fontSize: '9.5px', color: '#a0aec0', display: 'block' }}>Add, edit or remove products</span>
                  </div>
                </button>

                <button onClick={() => setActiveMenuId('orders')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#edf2f7'}>
                  <span style={{ display: 'inline-flex', background: '#ebf8f2', padding: '8px', borderRadius: '8px', color: 'var(--primary-green)' }}>{renderDashboardIcon('quick-bag', 'var(--primary-green)')}</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', display: 'block', color: 'var(--dark)' }}>View Orders</strong>
                    <span style={{ fontSize: '9.5px', color: '#a0aec0', display: 'block' }}>Track all platform orders</span>
                  </div>
                </button>

                <button onClick={() => setActiveMenuId('heatmap')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#edf2f7'}>
                  <span style={{ display: 'inline-flex', background: '#ebf8f2', padding: '8px', borderRadius: '8px', color: 'var(--primary-green)' }}>{renderDashboardIcon('quick-map', 'var(--primary-green)')}</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', display: 'block', color: 'var(--dark)' }}>Demand Heatmap</strong>
                    <span style={{ fontSize: '9.5px', color: '#a0aec0', display: 'block' }}>View live demand areas</span>
                  </div>
                </button>

                <button onClick={() => setActiveMenuId('reports')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc', border: '1px solid #edf2f7', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#edf2f7'}>
                  <span style={{ display: 'inline-flex', background: '#ebf8f2', padding: '8px', borderRadius: '8px', color: 'var(--primary-green)' }}>{renderDashboardIcon('quick-chart', 'var(--primary-green)')}</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', display: 'block', color: 'var(--dark)' }}>Generate Report</strong>
                    <span style={{ fontSize: '9.5px', color: '#a0aec0', display: 'block' }}>Download analytics report</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

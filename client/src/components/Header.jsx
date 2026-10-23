import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function Header() {
  const navigate = useNavigate();
  const { 
    cart, 
    wishlist, 
    isLoggedIn, 
    currentUser, 
    wallet, 
    setShowQRScanner, 
    setShowLogin, 
    setShowProfileModal, 
    logoutUser, 
    isDarkMode, 
    toggleDarkMode,
    setShowBalconyModal,
    setShowClubModal,
    setShowHospitalModal
  } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Notification Center State
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = () => {
      api.getNotifications(8)
        .then(res => {
          if (res?.success) setNotifications(res.notifications || []);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleQRScanClick = () => {
    setShowQRScanner(true);
  };

  const handleProfileClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLogin(true);
    } else {
      e.preventDefault();
      setShowDropdown(!showDropdown);
    }
  };

  const getDashboardRoute = () => {
    if (!isLoggedIn) return "/profile";
    if (currentUser?.role === 'Admin') return "/admin";
    return "/profile";
  };

  return (
    <>
      <style>{`
        @keyframes headerDropdownFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      <header>
        <div className="header-container">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="PlantMe.in" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        </Link>
        
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Explore Plants</NavLink>
          
          {(!isLoggedIn || currentUser?.role === 'Customer') && (
            <>
              <NavLink to="/nurseries" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Nurseries & Stalls</NavLink>
              <NavLink to="/map" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Live Map</NavLink>
              <NavLink to="/ai" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>AI Plant Doctor</NavLink>
              <NavLink to="/garden" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Virtual Garden</NavLink>
              <NavLink to="/passport" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Plant Passports</NavLink>
              <NavLink to="/planner" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Garden Studio</NavLink>
              <NavLink to="/corporate" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>B2B Retainers</NavLink>
              <NavLink to="/community" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Community</NavLink>
            </>
          )}

          {isLoggedIn && currentUser?.role === 'Admin' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Admin Portal</NavLink>
          )}
        </nav>


        <div className="header-actions">
          {/* Live Alerts & WhatsApp Notification Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="action-btn"
              title="Live Alerts & WhatsApp"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="badge" style={{ background: '#25D366' }}>
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '320px',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'headerDropdownFadeIn 0.2s ease-out'
              }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px' }}>💬</span>
                    <strong style={{ fontSize: '13px' }}>WhatsApp & Order Alerts</strong>
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '8px' }}>
                    Live
                  </span>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      No new alerts. Your plant orders & care reminders will appear here.
                    </div>
                  ) : (
                    notifications.map(notice => (
                      <div
                        key={notice.id}
                        onClick={() => {
                          api.markNotificationRead(notice.id);
                          setNotifications(prev => prev.map(n => n.id === notice.id ? { ...n, isRead: true } : n));
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: notice.isRead ? '#ffffff' : '#f0fdf4',
                          border: notice.isRead ? '1px solid #f1f5f9' : '1px solid #bbf7d0',
                          marginBottom: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366' }} />
                            {notice.title}
                          </span>
                          <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>{notice.timestamp}</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                          {notice.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <Link
                    to="/profile"
                    onClick={() => setShowNotifDropdown(false)}
                    style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textDecoration: 'none' }}
                  >
                    View All Activity in Profile →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist */}
          {(!isLoggedIn || currentUser?.role === 'Customer') && (
            <Link to="/wishlist" className="action-btn" title="My Wishlist">
              <svg width="22" height="22"><use href="#icon-wishlist"></use></svg>
              {wishlist.length > 0 && (
                <span className="badge" id="wishlist-badge">{wishlist.length}</span>
              )}
            </Link>
          )}
          
          {/* Cart */}
          {(!isLoggedIn || currentUser?.role === 'Customer') && (
            <Link to="/cart" className="action-btn" title="Shopping Cart">
              <svg width="22" height="22"><use href="#icon-cart"></use></svg>
              {cart.length > 0 && (
                <span className="badge" id="cart-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              )}
            </Link>
          )}
          
          {/* User Profile & Wallet */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={handleProfileClick} 
              className="action-btn" 
              title="My Account" 
              style={{ 
                gap: '6px', 
                padding: '0 12px', 
                width: 'auto',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Profile" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <svg width="22" height="22"><use href="#icon-user"></use></svg>
              )}
              {isLoggedIn && currentUser?.role === 'Customer' && (
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-green)' }} id="header-wallet-bal">
                  ₹{Math.round(wallet)}
                </span>
              )}
              {isLoggedIn && currentUser?.role !== 'Customer' && (
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-green)' }}>
                  {currentUser.name.split(' ')[0]} ({currentUser.role})
                </span>
              )}
            </button>

            {isLoggedIn && showDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '240px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                padding: '16px',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animation: 'headerDropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transformOrigin: 'top right'
              }}>
                {/* User Header Info: Name & Email below name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1b4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0, overflow: 'hidden' }}>
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                    )}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser?.name || 'User'}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {currentUser?.email || 'customer@plantme.in'}
                    </span>
                  </div>
                </div>

                {/* Menu Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link 
                    to={getDashboardRoute()} 
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#1b4332', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Account Settings & Profile
                  </Link>

                  <Link 
                    to="/wishlist" 
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#1b4332', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    My Wishlist ({wishlist.length})
                  </Link>

                  <Link 
                    to="/passport" 
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#1b4332', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🪴 Plant Passports & Diary
                  </Link>

                  <Link 
                    to="/planner" 
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#1b4332', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🎨 Balcony & Room Visualizer
                  </Link>

                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0', paddingTop: '4px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', padding: '4px 12px', textTransform: 'uppercase' }}>
                      Botanical Services
                    </div>
                    
                    <button
                      onClick={() => { setShowDropdown(false); setShowBalconyModal(true); }}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', color: '#1b4332', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Balcony Makeover (₹499)
                    </button>

                    <button
                      onClick={() => { setShowDropdown(false); setShowClubModal(true); }}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', color: '#1b4332', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Mystery Box Club (₹349/mo)
                    </button>

                    <button
                      onClick={() => { setShowDropdown(false); setShowHospitalModal(true); }}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', color: '#1b4332', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Vacation Boarding & ICU
                    </button>
                  </div>
                </div>

                {/* Logout Button below options */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logoutUser();
                      navigate('/');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}

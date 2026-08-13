import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { cart, wishlist, isLoggedIn, currentUser, wallet, setShowQRScanner, setShowLogin, setShowProfileModal, logoutUser, isDarkMode, toggleDarkMode } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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
    if (currentUser?.role === 'Customer') return "/profile";
    if (currentUser?.role === 'Vendor') return "/vendor";
    if (currentUser?.role === 'Admin') return "/admin";
    if (currentUser?.role === 'Delivery Partner') return "/delivery";
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
        <Link to="/" className="logo">
          <svg className="logo-leaf"><use href="#icon-leaf"></use></svg>
          PLANTO
        </Link>
        
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Explore Nurseries</NavLink>
          
          {(!isLoggedIn || currentUser?.role === 'Customer') && (
            <>
              <NavLink to="/map" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Nearby Stalls Map</NavLink>
              <NavLink to="/ai" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>AI Plant Doctor</NavLink>
              <NavLink to="/garden" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Virtual Garden</NavLink>
              <NavLink to="/community" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Community</NavLink>
            </>
          )}

          {isLoggedIn && currentUser?.role === 'Vendor' && (
            <NavLink to="/vendor" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>🏪 Nursery Vendor Desk</NavLink>
          )}

          {isLoggedIn && currentUser?.role === 'Delivery Partner' && (
            <NavLink to="/delivery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>🛵 Delivery Desk</NavLink>
          )}

          {isLoggedIn && currentUser?.role === 'Admin' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Admin Portal</NavLink>
          )}
        </nav>


        <div className="header-actions">
          <button 
            className="action-btn" 
            onClick={toggleDarkMode} 
            title="Toggle Dark Mode"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
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
              <svg width="22" height="22"><use href="#icon-user"></use></svg>
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
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1b4332', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1b4332', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser?.name || 'User'}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {currentUser?.email || 'customer@planto.in'}
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
                    <span>⚙️</span> Account Settings & Profile
                  </Link>

                  <Link 
                    to="/wishlist" 
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#1b4332', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f4f9f5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>❤️</span> My Wishlist ({wishlist.length})
                  </Link>
                </div>

                {/* Logout Button below options */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logoutUser();
                      window.location.hash = "#/";
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
                    <span>🚪</span> Logout Account
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

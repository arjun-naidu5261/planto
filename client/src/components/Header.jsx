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
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          
          {(!isLoggedIn || currentUser?.role === 'Customer') && (
            <>
              <NavLink to="/map" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Discover Stalls</NavLink>
              <NavLink to="/ai" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>AI Diagnostician</NavLink>
              <NavLink to="/garden" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Virtual Garden</NavLink>
              <NavLink to="/community" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Community</NavLink>
            </>
          )}

          {isLoggedIn && currentUser?.role === 'Vendor' && (
            <NavLink to="/vendor" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Vendor Desk</NavLink>
          )}

          {isLoggedIn && currentUser?.role === 'Delivery Partner' && (
            <NavLink to="/delivery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Delivery Desk</NavLink>
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
            <Link to="/profile" className="action-btn" title="My Wishlist">
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
                top: 'calc(100% + 8px)',
                right: 0,
                width: '140px',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                padding: '4px',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                animation: 'headerDropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transformOrigin: 'top right'
              }}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logoutUser();
                    window.location.hash = "#/";
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#d32f2f',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#ffebee';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}

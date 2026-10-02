import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav() {
  const { isLoggedIn, currentUser, setShowLogin, setShowProfileModal, cart } = useApp();
  const totalCartCount = cart ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const handleProfileClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLogin(true);
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
    <div className="mobile-bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </NavLink>

      {(!isLoggedIn || currentUser?.role === 'Customer') && (
        <>
          <NavLink to="/garden" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M8 8a4 4 0 1 1 8 0"/></svg>
            Garden
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
            <svg width="20" height="20"><use href="#icon-ai"></use></svg>
            AI Doctor
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"} style={{ position: 'relative' }}>
            <svg width="20" height="20"><use href="#icon-cart"></use></svg>
            {totalCartCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '12px', background: 'var(--primary-green)', color: '#fff', fontSize: '9px', fontWeight: 800, minWidth: '16px', height: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                {totalCartCount}
              </span>
            )}
            Cart
          </NavLink>
        </>
      )}

      {isLoggedIn && currentUser?.role === 'Vendor' && (
        <NavLink to="/vendor" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
          <svg width="20" height="20"><use href="#icon-vendor"></use></svg>
          Vendor Panel
        </NavLink>
      )}

      {isLoggedIn && currentUser?.role === 'Delivery Partner' && (
        <NavLink to="/delivery" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
          <svg width="20" height="20"><use href="#icon-gps"></use></svg>
          Delivery Panel
        </NavLink>
      )}

      {isLoggedIn && currentUser?.role === 'Admin' && (
        <NavLink to="/admin" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
          <svg width="20" height="20"><use href="#icon-admin"></use></svg>
          Admin Panel
        </NavLink>
      )}

      <NavLink to={getDashboardRoute()} className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"} onClick={handleProfileClick}>
        <svg width="20" height="20"><use href="#icon-user"></use></svg>
        {isLoggedIn ? 'My Account' : 'Sign In'}
      </NavLink>
    </div>
  );
}

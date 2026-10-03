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
    if (currentUser?.role === 'Admin') return "/admin";
    return "/profile";
  };

  return (
    <div className="mobile-bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </NavLink>

      {(!isLoggedIn || currentUser?.role === 'Customer') && (
        <>
          <NavLink to="/garden" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M8 8a4 4 0 1 1 8 0"/></svg>
            <span>Garden</span>
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
            <svg width="20" height="20"><use href="#icon-ai"></use></svg>
            <span>AI Doctor</span>
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20"><use href="#icon-cart"></use></svg>
              {totalCartCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-10px', background: 'var(--primary-green)', color: '#fff', fontSize: '9px', fontWeight: 800, minWidth: '15px', height: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </NavLink>
        </>
      )}

      {isLoggedIn && currentUser?.role === 'Admin' && (
        <NavLink to="/admin" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
          <svg width="20" height="20"><use href="#icon-admin"></use></svg>
          <span>Admin</span>
        </NavLink>
      )}

      <NavLink to={getDashboardRoute()} className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"} onClick={handleProfileClick}>
        <svg width="20" height="20"><use href="#icon-user"></use></svg>
        <span>{isLoggedIn ? 'Account' : 'Sign In'}</span>
      </NavLink>
    </div>
  );
}

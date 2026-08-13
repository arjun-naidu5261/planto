import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav() {
  const { isLoggedIn, currentUser, setShowLogin, setShowProfileModal } = useApp();

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
        <svg width="20" height="20"><use href="#icon-leaf"></use></svg>
        Home
      </NavLink>

      {(!isLoggedIn || currentUser?.role === 'Customer') && (
        <>
          <NavLink to="/map" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
            <svg width="20" height="20"><use href="#icon-map"></use></svg>
            Stalls Map
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => isActive ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}>
            <svg width="20" height="20"><use href="#icon-ai"></use></svg>
            AI Diagnostic
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

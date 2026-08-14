import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiBriefcase, FiMenu, FiX, FiCompass,
  FiPlusSquare, FiMessageCircle, FiUser, FiLogOut, FiSun, FiMoon, FiChevronDown
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
  const { user, unreadTotal, openLogoutModal } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  /* Close dropdowns when route changes */
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  /* Close dropdowns when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfileDropdown = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(prev => !prev);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    if (openLogoutModal) {
      openLogoutModal();
    }
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="top-header">
      {/* Brand logo + name */}
      <div className="header-left">
        <Link to="/" className="top-header-brand">
          <div className="brand-icon">
            <FiBriefcase />
          </div>
          <div className="brand-title-group">
            <span className="brand-name">LocalHire</span>
            <span className="brand-tag">LOCAL JOBS</span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="desktop-nav-links">
        <Link to="/explore" className={`desktop-nav-item ${isActivePath('/explore') ? 'active' : ''}`}>
          <FiCompass size={18} />
          <span>Explore</span>
        </Link>

        {user && (
          <>
            <Link to="/create-post" className={`desktop-nav-item ${isActivePath('/create-post') ? 'active' : ''}`}>
              <FiPlusSquare size={18} />
              <span>Post Job/Skill</span>
            </Link>
            <Link to="/messages" className={`desktop-nav-item ${isActivePath('/messages') ? 'active' : ''}`}>
              <div className="nav-icon-badge-wrap">
                <FiMessageCircle size={18} />
                {unreadTotal > 0 && <span className="header-badge">{unreadTotal}</span>}
              </div>
              <span>Messages</span>
            </Link>
            <Link to="/profile" className={`desktop-nav-item ${isActivePath('/profile') ? 'active' : ''}`}>
              <FiUser size={18} />
              <span>Profile</span>
            </Link>
          </>
        )}
      </nav>

      {/* Right Actions Bar */}
      <div className="header-right-actions">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <FiSun size={18} className="sun-icon" /> : <FiMoon size={18} className="moon-icon" />}
          <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {user ? (
          <div className="user-profile-menu-wrapper" ref={profileRef}>
            <button
              type="button"
              className="user-profile-pill-btn"
              onClick={toggleProfileDropdown}
              aria-expanded={isProfileDropdownOpen}
            >
              <div className="header-avatar-small">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="header-user-firstname">{user.name?.split(' ')[0]}</span>
              <FiChevronDown size={16} className={`chevron-icon ${isProfileDropdownOpen ? 'open' : ''}`} />
            </button>

            {isProfileDropdownOpen && (
              <div className="header-dropdown-menu profile-dropdown">
                <div className="profile-dropdown-header">
                  <p className="dropdown-user-name">{user.name}</p>
                  <p className="dropdown-user-email">{user.email}</p>
                </div>
                <div className="header-menu-divider" />
                <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="header-menu-item">
                  <FiUser size={18} /> My Profile
                </Link>
                <Link to="/create-post" onClick={() => setIsProfileDropdownOpen(false)} className="header-menu-item">
                  <FiPlusSquare size={18} /> Create Post
                </Link>
                <Link to="/messages" onClick={() => setIsProfileDropdownOpen(false)} className="header-menu-item">
                  <FiMessageCircle size={18} /> Messages
                </Link>
                <div className="header-menu-divider" />
                <button type="button" onClick={handleLogoutClick} className="header-menu-item header-logout-item">
                  <FiLogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-header-btn-group desktop-only-auth">
            <Link to="/login" className="btn btn-secondary header-login-btn">Log In</Link>
            <Link to="/register" className="btn btn-primary header-signup-btn">Sign Up</Link>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <div className="header-menu-wrapper mobile-only" ref={menuRef}>
          <button
            type="button"
            className="hamburger-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            title="Menu"
          >
            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          {isMenuOpen && (
            <div className="header-dropdown-menu mobile-dropdown">
              <Link to="/explore" onClick={() => setIsMenuOpen(false)} className="header-menu-item">
                <FiCompass size={18} /> Explore
              </Link>
              {user ? (
                <>
                  <Link to="/create-post" onClick={() => setIsMenuOpen(false)} className="header-menu-item">
                    <FiPlusSquare size={18} /> Create Post
                  </Link>
                  <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="header-menu-item">
                    <FiMessageCircle size={18} /> Messages {unreadTotal > 0 && `(${unreadTotal})`}
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="header-menu-item">
                    <FiUser size={18} /> Profile
                  </Link>
                  <div className="header-menu-divider" />
                  <button type="button" onClick={handleLogoutClick} className="header-menu-item header-logout-item">
                    <FiLogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="header-menu-divider" />
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="header-menu-item">
                    <FiUser size={18} /> Log In
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="header-menu-item">
                    <FiPlusSquare size={18} /> Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

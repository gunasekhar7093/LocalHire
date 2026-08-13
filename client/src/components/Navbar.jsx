import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiCompass, FiPlusSquare, FiMessageCircle, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, unreadTotal } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null; // Don't show navbar if not logged in

  const navItems = [
    { name: 'Explore', path: '/explore', icon: <FiCompass size={24} /> },
    { name: 'Post', path: '/create-post', icon: <FiPlusSquare size={24} /> },
    { name: 'Messages', path: '/messages', icon: <FiMessageCircle size={24} /> },
    { name: 'Profile', path: '/profile', icon: <FiUser size={24} /> },
  ];

  return (
    <nav className="bottom-navbar">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.name} 
            to={item.path} 
            aria-label={`${item.name} section`}
            className={`nav-link-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-wrapper">
              {item.name === 'Messages' && unreadTotal > 0 && (
                <div className="nav-unread-badge">
                  {unreadTotal}
                </div>
              )}
              {item.icon}
            </div>
            <span className={`nav-label ${isActive ? 'bold' : ''}`}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;

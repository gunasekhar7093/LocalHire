import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

export const socket = io(API_BASE_URL);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Invalid user session:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user._id) {
      // Join personal room for global notifications
      socket.emit('join_room', user._id);

      // Fetch initial total unread
      const fetchUnread = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.get(`${API_BASE_URL}/api/messages/unread-total`, config);
          setUnreadTotal(res.data.unreadTotal);
        } catch (err) {
          console.error('Error fetching unread count:', err);
        }
      };
      fetchUnread();

      // Listen for incoming messages globally
      const handleReceiveMsg = (data) => {
        if (activeChatId !== data.room) {
          setUnreadTotal(prev => prev + 1);
        }
      };
      
      socket.on('receive_message', handleReceiveMsg);
      return () => {
        socket.off('receive_message', handleReceiveMsg);
      };
    }
  }, [user, activeChatId]);

  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/explore');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const login = async (userData) => {
    try {
      setError(null);
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, userData);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/explore');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`${API_BASE_URL}/api/auth/me`, userData, config);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    navigate('/');
  };

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  return (
    <AuthContext.Provider value={{ 
      user, loading, error, register, login, logout, updateProfile, setError,
      unreadTotal, setUnreadTotal, activeChatId, setActiveChatId,
      showLogoutModal, openLogoutModal, closeLogoutModal
    }}>
      {children}

      {/* Global Logout Modal (triggered from Profile or other components) */}
      {showLogoutModal && (
        <div className="header-modal-overlay" onClick={closeLogoutModal}>
          <div className="header-logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="header-logout-modal-title">Logout?</h3>
            <p className="header-logout-modal-desc">
              Are you sure you want to log out of your account?
            </p>
            <div className="header-logout-modal-actions">
              <button
                className="header-logout-cancel-btn"
                onClick={closeLogoutModal}
              >
                Cancel
              </button>
              <button
                className="header-logout-confirm-btn"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

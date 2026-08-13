import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/adminlogin');
      return;
    }
    fetchUsers();
  }, [navigate, token]);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`, config);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/adminlogin');
      }
    }
  };

  const handleDeleteUserClick = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/api/auth/user/${userToDelete.id}`, config);
      setUsers(users.filter(u => u._id !== userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete user');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('adminToken');
    navigate('/adminlogin');
  };

  return (
    <div className="container admin-dashboard-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <button onClick={handleLogoutClick} className="btn admin-logout-btn">Logout</button>
      </div>
      
      <div className="card table-card">
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              <th className="admin-th">Name</th>
              <th className="admin-th">Email</th>
              <th className="admin-th">Phone</th>
              <th className="admin-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="admin-tr">
                <td className="admin-td">{u.name}</td>
                <td className="admin-td">{u.email}</td>
                <td className="admin-td">{u.phone || 'N/A'}</td>
                <td className="admin-td">
                  <button 
                    onClick={() => handleDeleteUserClick(u._id, u.name)}
                    className="delete-user-btn"
                  >
                    Delete User
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-table-cell">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sleek Delete User Modal */}
      {userToDelete && (
        <div className="modal-overlay">
          <div className="admin-modal-card">
            <h3 className="admin-modal-title">
              Delete {userToDelete.name}?
            </h3>
            <p className="admin-modal-desc">
              Are you absolutely sure you want to permanently delete this user? 
            </p>
            <p className="admin-warning-text">
              Warning: This will also instantly wipe all of their posts, conversations, and messages from the database. This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button 
                onClick={() => setUserToDelete(null)}
                className="admin-modal-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="admin-modal-delete-btn"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="admin-modal-card admin-modal-card-sm">
            <h3 className="admin-modal-title">
              Confirm Logout
            </h3>
            <p className="admin-modal-desc admin-modal-desc-lg">
              Are you sure you want to log out of the Admin Portal?
            </p>
            <div className="admin-modal-actions">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="admin-modal-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="admin-modal-logout-btn"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

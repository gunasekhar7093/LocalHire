import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './styles/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin-login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admindashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <div className="container admin-login-container">
      <div className="card admin-login-card">
        <h2 className="admin-login-title">Admin Portal Login</h2>
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={handleLogin} className="admin-login-form">
          <div>
            <label className="form-label-bold">Admin ID</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="form-label-bold">Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input password-input" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary admin-login-submit-btn">Login as Admin</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

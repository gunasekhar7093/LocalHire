import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, setError } = useContext(AuthContext);

  useEffect(() => {
    setError(null);
    return () => setError(null);
  }, [setError]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <h2 className="auth-title">Log in</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="input password-input" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            <div className="forgot-password-wrapper">
              <Link to="/forgot" className="forgot-password-link">Forgot Password?</Link>
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-submit-btn">Login</button>
        </form>
        <p className="auth-redirect-text">
          Don't have an account? <Link to="/register" className="auth-link-primary">Register</Link>
        </p>
        <p className="admin-login-wrapper">
          <Link to="/adminlogin" className="admin-login-link">Admin Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

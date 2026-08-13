import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { email, otp, password });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="container forgot-container">
      <div className="card forgot-card">
        <h2 className="forgot-title">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>
        {error && <div className="forgot-error">{error}</div>}
        {success && <div className="forgot-success">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="forgot-form">
            <p className="forgot-info-text">
              Enter your registered email address and we will send you a 6-digit OTP to reset your password.
            </p>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} className="input" required />
            </div>
            <button type="submit" className="btn btn-primary forgot-submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <p className="otp-info-text">
              We've sent a password reset OTP to <strong>{email}</strong>.
            </p>
            <div>
              <label className="form-label">6-Digit OTP</label>
              <input type="text" value={otp} onChange={(e) => { setOtp(e.target.value); setError(null); }} className="input otp-input" maxLength="6" required />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} className="input password-input" minLength="8" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }} className="input password-input" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-btn">
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary forgot-submit-btn" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="go-back-btn">
              Go Back
            </button>
          </form>
        )}

        <p className="forgot-redirect-text">
          Back to <Link to="/login" className="forgot-link-primary">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

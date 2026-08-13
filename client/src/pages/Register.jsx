import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { register, error, setError } = useContext(AuthContext);

  useEffect(() => {
    setError(null);
    return () => setError(null);
  }, [setError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
       setError("Passwords do not match");
       return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { email: formData.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError("Please enter the OTP");
      return;
    }
    register({ name: formData.name, email: formData.email, password: formData.password, otp: formData.otp });
  };

  return (
    <div className="container register-container">
      <div className="card register-card">
        <h2 className="register-title">
          {step === 1 ? 'Create an Account' : 'Verify Email'}
        </h2>
        {error && <div className="register-error">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="register-form">
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="input password-input" minLength="8" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input password-input" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-btn">
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary register-submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Next / Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="register-form">
            <p className="otp-info-text">
              We've sent a 6-digit code to <strong>{formData.email}</strong>. Please enter it below.
            </p>
            <div>
              <label className="form-label">6-Digit OTP</label>
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="input otp-input" maxLength="6" required />
            </div>
            <button type="submit" className="btn btn-primary register-submit-btn">Register Account</button>
            <button type="button" onClick={() => setStep(1)} className="go-back-btn">
              Go Back
            </button>
          </form>
        )}

        <p className="register-redirect-text">
          Already have an account? <Link to="/login" className="register-link-primary">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

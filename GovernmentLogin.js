// src/components/GovernmentLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import './GovernmentLogin.css';

const GovernmentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    department: '',
    accessCode: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Government-specific validation
    if (!formData.email || !formData.password || !formData.department) {
      setLoading(false);
      return setError('Please fill in all required fields.');
    }

    // Special government access validation
    if (formData.email !== 'admin@lifetag.com' || formData.password !== 'admin123') {
      setLoading(false);
      return setError('Invalid government credentials.');
    }

    if (formData.department !== 'health-ministry') {
      setLoading(false);
      return setError('Invalid department selection.');
    }

    try {
      const response = await apiClient.post('/users/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.adminId !== undefined) {
        login(response.data.token, 'admin', response.data.adminId, null);
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Government credentials required.');
      }
    } catch (err) {
      setError('Government authentication failed.');
    }

    setLoading(false);
  };

  return (
    <div className="gov-login-wrapper">
      <div className="gov-login-card">
        <div className="gov-header">
          <div className="gov-logo">🏛️</div>
          <h2 className="gov-title">Government Health Ministry</h2>
          <p className="gov-subtitle">Secure Administrative Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="gov-form">
          <div className="form-group">
            <label>Official Email</label>
            <input
              type="email"
              name="email"
              className="gov-input"
              placeholder="admin@lifetag.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Secure Password</label>
            <input
              type="password"
              name="password"
              className="gov-input"
              placeholder="Enter secure password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              name="department"
              className="gov-input"
              required
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="health-ministry">Ministry of Health & Family Welfare</option>
              <option value="digital-health">National Digital Health Mission</option>
              <option value="medical-council">Medical Council of India</option>
            </select>
          </div>

          <div className="form-group">
            <label>Access Code (Optional)</label>
            <input
              type="text"
              name="accessCode"
              className="gov-input"
              placeholder="Special access code"
              value={formData.accessCode}
              onChange={handleChange}
            />
          </div>

          {error && <div className="gov-error">{error}</div>}

          <button type="submit" className="gov-login-btn" disabled={loading}>
            {loading ? '🔐 Authenticating...' : '🔐 Secure Government Login'}
          </button>
        </form>

        <div className="gov-footer">
          <p>⚠️ Authorized Personnel Only</p>
          <p>This system is monitored and logged</p>
        </div>
      </div>
    </div>
  );
};

export default GovernmentLogin;
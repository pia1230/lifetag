// src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import './Login.css'; // <-- NEW

const Login = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // Basic validation
    if (!formData.email || !formData.password) {
      setLoading(false);
      return setError('Please enter both email and password.');
    }

    if (!formData.email.includes('@')) {
      setLoading(false);
      return setError('Please enter a valid email address.');
    }

    let roleUrl = '';
    let redirectPath = '';

    if (role === 'patient') {
      roleUrl = '/users/login';
      redirectPath = '/dashboard';
    } else if (role === 'doctor') {
      roleUrl = '/doctors/login';
      redirectPath = '/dashboard';
    } else if (role === 'admin') {
      roleUrl = '/users/login'; // Admin login uses same endpoint
      redirectPath = '/admin/dashboard';
    }

    const loginData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    };

    try {
      console.log('Attempting login:', { role, url: roleUrl, email: loginData.email });
      const response = await apiClient.post(roleUrl, loginData);
      console.log('Login response:', response.data);
      
      const { token, patientId, doctorId, adminId, patientTagId } = response.data;
      let internalId = '';
      let tagId = null;
      let finalRole = role;
      let finalRedirect = redirectPath;

      if (role === 'patient') {
        internalId = patientId;
        tagId = patientTagId;
      } else if (role === 'doctor') {
        internalId = doctorId;
      }

      // Check if response contains adminId (hardcoded admin login via /users/login)
      if (response.data.adminId !== undefined) {
        finalRole = 'admin';
        internalId = adminId;
        finalRedirect = '/admin/dashboard';
      }

      console.log('Login successful, storing auth:', { finalRole, internalId, tagId });
      login(token, finalRole, internalId, tagId);
      navigate(finalRedirect);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed.';
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h2 className="title">Login to Your Account</h2>

        {/* Role Selector - 3 options: Patient, Doctor & Government */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'patient' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('patient')}
          >
            👤 Patient
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'doctor' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            👨‍⚕️ Doctor
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'admin' ? 'role-btn-active' : ''}`}
            onClick={() => setRole('admin')}
          >
            🏛️ Government
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">

          <label>Email</label>
          <input
            type="email"
            name="email"
            className="modern-input"
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            className="modern-input"
            placeholder="Your password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button glossy-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

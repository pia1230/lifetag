import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api";
import { useAuth } from "../../components/context/AuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post("/admin/login", form);
      const { token, adminId } = res.data;
      
      // Store token and role in AuthContext
      login(token, "admin", adminId, null);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h2 className="admin-title">Admin Login</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="modern-input"
            placeholder="admin@lifetag.com"
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            className="modern-input"
            placeholder="Your password"
            onChange={handleChange}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button glossy-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="admin-footer-text">
          Don't have an admin account? <a href="/admin/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

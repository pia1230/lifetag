import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api";
import "./AdminRegister.css";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
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
      await apiClient.post("/admin/create-super", form);
      navigate("/admin/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="admin-register-wrapper">
      <div className="admin-register-card">
        <h2 className="admin-title">Create Admin Account</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            className="modern-input"
            placeholder="Your full name"
            onChange={handleChange}
            required
          />

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
            placeholder="Create a strong password"
            onChange={handleChange}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button glossy-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        <p className="admin-footer-text">
          Already have an account? <a href="/admin/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

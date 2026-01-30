import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p className="sub">Manage users, reports and verifications</p>
      </div>

      <div className="admin-actions">
        <button className="primary-button" onClick={() => navigate('/admin/users')}>
          View Users
        </button>

        <button className="primary-button" onClick={() => navigate('/admin/reports')}>
          View Reports
        </button>

        <button className="primary-button" onClick={() => navigate('/admin/block-users')}>
          Block / Unblock Users
        </button>

        <button className="primary-button" onClick={() => navigate('/admin/verify-doctors')}>
          Verify Doctors
        </button>

        <button className="primary-button" onClick={() => navigate('/admin/verify-aadhaar')}>
          Verify Aadhaar
        </button>
      </div>
    </div>
  );
}

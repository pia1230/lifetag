// src/pages/admin/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from '../../components/WelcomeHeader';
import ShortcutCard from '../../components/ShortcutCard';
import apiClient from '../../api';
import { useAuth } from '../../components/context/AuthContext';
import '../../components/Home.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/admin/summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Error fetching admin summary:', err);
        // Fallback mock data
        setSummary({ patients: 0, doctors: 0, reports: 0, blocked: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (auth?.role === 'admin') fetchSummary();
  }, [auth]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <WelcomeHeader />

      <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 16px' }}>
        {/* Summary Cards */}
        <div className="admin-summary-cards">
          <div className="summary-card">
            <div className="summary-number">{summary?.patients || 0}</div>
            <div className="summary-label">Total Patients</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{summary?.doctors || 0}</div>
            <div className="summary-label">Total Doctors</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{summary?.reports || 0}</div>
            <div className="summary-label">Total Reports</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{summary?.blocked || 0}</div>
            <div className="summary-label">Suspended Accounts</div>
          </div>
        </div>

        {/* Admin Action Cards */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ color: '#620469', marginLeft: 0 }}>Admin Actions</h3>
          <div className="shortcut-grid-doctor">
            <ShortcutCard title="Manage Users" icon="👥" to="/admin/users" />
            <ShortcutCard title="View Reports" icon="📋" to="/admin/reports" />
            <ShortcutCard title="Block/Unblock" icon="🚫" to="/admin/block-users" />
            <ShortcutCard title="Verify Doctors" icon="✅" to="/admin/verify-doctors" />
            <ShortcutCard title="Verify Aadhaar" icon="🛡️" to="/admin/verify-aadhaar" />
            <ShortcutCard 
              title="Logout" 
              icon="🚪" 
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

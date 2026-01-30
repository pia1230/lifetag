// src/components/GovernmentDashboard.js
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import './RefreshStyles.css';
import './GovernmentDashboard.css';

const GovernmentDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalRecords: 0,
    totalAccessRequests: 0,
    blockedUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/recent-activity')
      ]);
      
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading Government Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="government-dashboard">
      <div className="page-header-container">
        <h2 className="page-header">🏛️ Government Health Ministry Dashboard</h2>
        <button onClick={fetchDashboardData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Registered Patients</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{stats.totalDoctors}</h3>
            <p>Verified Doctors</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalRecords}</h3>
            <p>Medical Records</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <h3>{stats.totalAccessRequests}</h3>
            <p>Access Requests</p>
          </div>
        </div>
        
        <div className="stat-card alert">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <h3>{stats.blockedUsers}</h3>
            <p>Blocked Users</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card">
        <h3>Recent System Activity</h3>
        {recentActivity.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-details">
                  <strong>{activity.action}</strong>
                  <span>{activity.details}</span>
                  <small>{new Date(activity.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <h3>Government Controls</h3>
        <div className="quick-actions">
          <button className="action-btn primary">
            📊 Generate Health Report
          </button>
          <button className="action-btn secondary">
            🔍 Audit System Logs
          </button>
          <button className="action-btn warning">
            ⚠️ Security Alerts
          </button>
          <button className="action-btn danger">
            🚨 Emergency Protocols
          </button>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
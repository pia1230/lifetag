// src/components/PatientDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeHeader from "./WelcomeHeader";
import ShortcutCard from "./ShortcutCard";
import apiClient from "../api";
import { useAuth } from "./context/AuthContext";
import "./Home.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/users/profile');
        // Accept either flat object or { patient: { ... } }
        const data = res.data.patient || res.data;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching patient profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (auth) fetchProfile();
  }, [auth]);

  const handleReportDoctor = () => {
    navigate('/report-user?targetRole=doctor');
  };

  return (
    <div className="home-container">
      <WelcomeHeader />

      <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
        <div className="shortcut-grid-patient">
          <ShortcutCard title="My Profile" icon="👤" to="/profile" />
          <ShortcutCard title="My Records" icon="📋" to="/my-records" />
          <ShortcutCard title="My Requests" icon="🔔" to="/my-requests" />
          <ShortcutCard title="Report Doctor" icon="⚠️" onClick={handleReportDoctor} />
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Patient Summary</h3>
            {loading && <p>Loading profile...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {profile && (
              <div>
                <p><strong>Name:</strong> {profile.fullName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Age:</strong> {profile.age || 'N/A'}</p>
                <p><strong>Gender:</strong> {profile.gender || 'N/A'}</p>
                <p><strong>Patient ID:</strong> {profile.patientTagId}</p>
                <p>
                  <strong>Aadhaar:</strong>{' '}
                  {profile.aadhaarVerified ? (
                    <span style={{ color: 'green' }}>Verified (XXXX-{profile.aadhaarLast4})</span>
                  ) : (
                    <span style={{ color: 'red' }}>Not Verified</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

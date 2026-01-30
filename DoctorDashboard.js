// src/components/DoctorDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from './WelcomeHeader';
import ShortcutCard from './ShortcutCard';
import './Home.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const handleReportPatient = () => {
    navigate('/report-user?targetRole=patient');
  };

  return (
    <div className="home-container">
      <WelcomeHeader />

      <div className="shortcut-grid-doctor">
        <ShortcutCard title="My Profile" icon="👤" to="/profile" />
        <ShortcutCard title="Request Access" icon="🔑" to="/request-access" />
        <ShortcutCard title="Sent Requests" icon="📤" to="/sent-requests" />
        <ShortcutCard title="View Records" icon="👀" to="/view-records" />
        <ShortcutCard title="Upload Record" icon="☁️" to="/upload-record" />
        <ShortcutCard title="Settings" icon="⚙️" to="/settings" />
        <ShortcutCard title="Verify Registration" icon="🛡️" to="/verify-doctor" />
        <ShortcutCard title="Report Patient" icon="⚠️" onClick={handleReportPatient} />
      </div>
    </div>
  );
};

export default DoctorDashboard;
// src/components/GovernmentDashboard.js
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import WelcomeHeader from './WelcomeHeader';
import ShortcutCard from './ShortcutCard';
import './Home.css';
import './RefreshStyles.css';
import './PatientRequests.css';

const GovernmentDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const { auth } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        apiClient.get('/admin/users?role=patient'),
        apiClient.get('/admin/users?role=doctor')
      ]);
      
      setPatients(patientsRes.data.users || []);
      setDoctors(doctorsRes.data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (doctorId) => {
    try {
      await apiClient.post('/admin/verify-user', {
        userId: doctorId,
        role: 'doctor'
      });
      
      setDoctors(doctors.map(doc => 
        doc.id === doctorId ? { ...doc, regVerified: true } : doc
      ));
      
      alert('Doctor verified successfully!');
    } catch (err) {
      console.error('Error verifying doctor:', err);
      alert('Failed to verify doctor');
    }
  };

  const blockUser = async (userId, role, isBlocked) => {
    try {
      await apiClient.post(`/admin/${isBlocked ? 'unsuspend' : 'suspend'}`, {
        userId,
        role
      });
      
      if (role === 'patient') {
        setPatients(patients.map(p => 
          p.id === userId ? { ...p, isBlocked: !isBlocked } : p
        ));
      } else {
        setDoctors(doctors.map(d => 
          d.id === userId ? { ...d, isBlocked: !isBlocked } : d
        ));
      }
      
      alert(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully!`);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status');
    }
  };

  const handleBackToOverview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveView('overview');
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && patients.length === 0 && doctors.length === 0) {
    return (
      <div className="home-container">
        <WelcomeHeader />
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <p>Loading Government Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && patients.length === 0 && doctors.length === 0) {
    return (
      <div className="home-container">
        <WelcomeHeader />
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <p className="error-message">{error}</p>
          <button onClick={fetchData} className="refresh-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <WelcomeHeader />

      {activeView === 'overview' && (
        <>
          <div className="admin-summary-cards">
            <div className="summary-card">
              <div className="summary-number">{patients.length}</div>
              <div className="summary-label">👥 Registered Patients</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">{doctors.length}</div>
              <div className="summary-label">👨⚕️ Registered Doctors</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">{doctors.filter(d => !d.regVerified).length}</div>
              <div className="summary-label">⏳ Pending Verifications</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">{[...patients, ...doctors].filter(u => u.isBlocked).length}</div>
              <div className="summary-label">🚫 Blocked Users</div>
            </div>
          </div>

          <div className="shortcut-grid-doctor">
            <ShortcutCard 
              title="Manage Patients" 
              icon="👥" 
              onClick={() => setActiveView('patients')} 
            />
            <ShortcutCard 
              title="Manage Doctors" 
              icon="👨⚕️" 
              onClick={() => setActiveView('doctors')} 
            />
            <ShortcutCard 
              title="Verify Doctors" 
              icon="✅" 
              onClick={() => setActiveView('verify')} 
            />
            <ShortcutCard 
              title="Refresh Data" 
              icon="🔄" 
              onClick={fetchData} 
            />
          </div>
        </>
      )}

      {activeView === 'patients' && (
        <>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: '#111' }}>👥 Registered Patients ({patients.length})</h3>
              <button 
                type="button"
                onClick={handleBackToOverview}
                className="action-button approve"
                style={{ padding: '0.5rem 1rem' }}
              >
                ← Back to Overview
              </button>
            </div>
          </div>
          
          <div className="glass-card">
            {patients.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center' }}>No patients registered</p>
            ) : (
              <div className="requests-list" style={{ maxHeight: '60vh', textAlign: 'center' }}>
                {patients.map(patient => (
                  <div key={patient.id} className="request-item">
                    <div className="request-details">
                      <strong>ID: {patient.patientTagId}</strong>
                      <span>{patient.fullName}</span>
                      <span>{patient.email}</span>
                      <span>Age: {patient.age || 'N/A'} | Gender: {patient.gender || 'N/A'}</span>
                      <span className="notes">
                        Aadhaar: {patient.aadhaarVerified ? '✅ Verified' : '⏳ Pending'} | 
                        Status: {patient.isBlocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </div>
                    <div className="request-actions">
                      <button 
                        type="button"
                        className={`action-button ${patient.isBlocked ? 'approve' : 'reject'}`}
                        onClick={() => blockUser(patient.id, 'patient', patient.isBlocked)}
                      >
                        {patient.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeView === 'doctors' && (
        <>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: '#111' }}>👨⚕️ Registered Doctors ({doctors.length})</h3>
              <button 
                type="button"
                onClick={handleBackToOverview}
                className="action-button approve"
                style={{ padding: '0.5rem 1rem' }}
              >
                ← Back to Overview
              </button>
            </div>
          </div>
          
          <div className="glass-card">
            {doctors.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center' }}>No doctors registered</p>
            ) : (
              <div className="requests-list" style={{ maxHeight: '60vh', textAlign: 'center' }}>
                {doctors.map(doctor => (
                  <div key={doctor.id} className="request-item">
                    <div className="request-details">
                      <strong>{doctor.medicalTitle || 'Dr.'} {doctor.fullName}</strong>
                      <span>{doctor.email}</span>
                      <span>{doctor.degree} - {doctor.specialization}</span>
                      <span>Department: {doctor.department || 'N/A'} | Experience: {doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : 'N/A'}</span>
                      <span>Hospital: {doctor.hospital || 'N/A'}</span>
                      {doctor.university && <span>University: {doctor.university}</span>}
                      {doctor.medicalCouncilReg && <span>Medical Council Reg: {doctor.medicalCouncilReg}</span>}
                      {doctor.consultationType && <span>Consultation: {doctor.consultationType}</span>}
                      {doctor.languagesSpoken && Array.isArray(doctor.languagesSpoken) && doctor.languagesSpoken.length > 0 && (
                        <span>Languages: {doctor.languagesSpoken.join(', ')}</span>
                      )}
                      {doctor.specialInterests && Array.isArray(doctor.specialInterests) && doctor.specialInterests.length > 0 && (
                        <span>Special Interests: {doctor.specialInterests.join(', ')}</span>
                      )}
                      {doctor.carePhilosophy && (
                        <span style={{ fontStyle: 'italic' }}>Philosophy: "{doctor.carePhilosophy}"</span>
                      )}
                      <span className="notes">
                        Verification: {doctor.regVerified ? '✅ Verified' : '⏳ Pending'} | 
                        Status: {doctor.isBlocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </div>
                    <div className="request-actions">
                      {!doctor.regVerified && (
                        <button 
                          type="button"
                          className="action-button approve"
                          onClick={() => verifyDoctor(doctor.id)}
                        >
                          ✅ Verify Doctor
                        </button>
                      )}
                      <button 
                        type="button"
                        className={`action-button ${doctor.isBlocked ? 'approve' : 'reject'}`}
                        onClick={() => blockUser(doctor.id, 'doctor', doctor.isBlocked)}
                      >
                        {doctor.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeView === 'verify' && (
        <>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: '#111' }}>✅ Doctor Verification Queue</h3>
              <button 
                type="button"
                onClick={handleBackToOverview}
                className="action-button approve"
                style={{ padding: '0.5rem 1rem' }}
              >
                ← Back to Overview
              </button>
            </div>
          </div>
          
          <div className="glass-card">
            {doctors.filter(d => !d.regVerified).length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center' }}>No doctors pending verification</p>
            ) : (
              <div className="requests-list" style={{ maxHeight: '60vh', textAlign: 'center' }}>
                {doctors.filter(d => !d.regVerified).map(doctor => (
                  <div key={doctor.id} className="request-item">
                    <div className="request-details">
                      <strong>{doctor.medicalTitle || 'Dr.'} {doctor.fullName}</strong>
                      <span>{doctor.email}</span>
                      <span>{doctor.degree} - {doctor.specialization}</span>
                      <span>Department: {doctor.department || 'N/A'} | Experience: {doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : 'N/A'}</span>
                      <span>Hospital: {doctor.hospital || 'N/A'}</span>
                      {doctor.university && <span>University: {doctor.university}</span>}
                      {doctor.medicalCouncilReg && <span>Medical Council Reg: {doctor.medicalCouncilReg}</span>}
                      {doctor.consultationType && <span>Consultation: {doctor.consultationType}</span>}
                      {doctor.languagesSpoken && Array.isArray(doctor.languagesSpoken) && doctor.languagesSpoken.length > 0 && (
                        <span>Languages: {doctor.languagesSpoken.join(', ')}</span>
                      )}
                      {doctor.carePhilosophy && (
                        <span style={{ fontStyle: 'italic' }}>Philosophy: "{doctor.carePhilosophy}"</span>
                      )}
                      <span className="notes">⏳ Awaiting verification</span>
                    </div>
                    <div className="request-actions">
                      <button 
                        type="button"
                        className="action-button approve"
                        onClick={() => verifyDoctor(doctor.id)}
                      >
                        ✅ Verify Doctor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GovernmentDashboard;
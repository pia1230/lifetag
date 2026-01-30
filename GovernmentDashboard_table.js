// src/components/GovernmentDashboard.js
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import './RefreshStyles.css';
import './GovernmentDashboard.css';

const GovernmentDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading Government Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="government-dashboard">
      <div className="page-header-container">
        <h2 className="page-header">🏛️ Government Health Ministry Portal</h2>
        <button onClick={fetchData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👥 Registered Patients ({patients.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          👨‍⚕️ Registered Doctors ({doctors.length})
        </button>
      </div>

      {activeTab === 'patients' && (
        <div className="data-table">
          <h3>Registered Patients</h3>
          {patients.length === 0 ? (
            <p>No patients registered</p>
          ) : (
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Aadhaar Verified</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.patientTagId}</td>
                    <td>{patient.fullName}</td>
                    <td>{patient.email}</td>
                    <td>{patient.age || 'N/A'}</td>
                    <td>{patient.gender || 'N/A'}</td>
                    <td>
                      <span className={`status ${patient.aadhaarVerified ? 'verified' : 'pending'}`}>
                        {patient.aadhaarVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${patient.isBlocked ? 'blocked' : 'active'}`}>
                        {patient.isBlocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`action-btn ${patient.isBlocked ? 'unblock' : 'block'}`}
                        onClick={() => blockUser(patient.id, 'patient', patient.isBlocked)}
                      >
                        {patient.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="data-table">
          <h3>Registered Doctors</h3>
          {doctors.length === 0 ? (
            <p>No doctors registered</p>
          ) : (
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Degree</th>
                  <th>Specialization</th>
                  <th>Hospital</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doctor => (
                  <tr key={doctor.id}>
                    <td>{doctor.id}</td>
                    <td>{doctor.fullName}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.degree}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.hospital || 'N/A'}</td>
                    <td>
                      <span className={`status ${doctor.regVerified ? 'verified' : 'pending'}`}>
                        {doctor.regVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${doctor.isBlocked ? 'blocked' : 'active'}`}>
                        {doctor.isBlocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!doctor.regVerified && (
                          <button 
                            className="action-btn verify"
                            onClick={() => verifyDoctor(doctor.id)}
                          >
                            ✅ Verify
                          </button>
                        )}
                        <button 
                          className={`action-btn ${doctor.isBlocked ? 'unblock' : 'block'}`}
                          onClick={() => blockUser(doctor.id, 'doctor', doctor.isBlocked)}
                        >
                          {doctor.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default GovernmentDashboard;
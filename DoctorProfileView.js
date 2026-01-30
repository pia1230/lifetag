import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import './PatientRequests.css';

const DoctorProfileView = ({ doctorId, onClose }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/admin/user?id=${doctorId}&role=doctor`);
        setDoctor(response.data.user);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading doctor profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={onClose} className="action-button">Close</button>
      </div>
    );
  }

  if (!doctor) return null;

  const parseJSON = (field) => {
    try {
      return field ? JSON.parse(field) : null;
    } catch {
      return null;
    }
  };

  const certifications = parseJSON(doctor.certifications);
  const conditionsTreated = parseJSON(doctor.conditionsTreated);
  const keyProcedures = parseJSON(doctor.keyProcedures);
  const specialInterests = parseJSON(doctor.specialInterests);
  const awards = parseJSON(doctor.awards);
  const publications = parseJSON(doctor.publications);
  const memberships = parseJSON(doctor.memberships);
  const languagesSpoken = parseJSON(doctor.languagesSpoken);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#111' }}>👨⚕️ Doctor Profile</h3>
          <button onClick={onClose} className="action-button" style={{ padding: '0.5rem 1rem' }}>✕ Close</button>
        </div>

        {/* Basic Information */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#f0f8ff' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>👨⚕️ Professional Information</h4>
          <p><strong>Name:</strong> {doctor.medicalTitle || 'Dr.'} {doctor.fullName}</p>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Degree:</strong> {doctor.degree}</p>
          <p><strong>Specialization:</strong> {doctor.specialization}</p>
          {doctor.department && <p><strong>Department:</strong> {doctor.department}</p>}
          {doctor.yearsOfExperience && <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>}
          <p><strong>Hospital/Clinic:</strong> {doctor.hospital || 'N/A'}</p>
          <p><strong>Verification Status:</strong> {doctor.regVerified ? '✅ Verified' : '⏳ Pending'}</p>
        </div>

        {/* Education & Credentials */}
        {(doctor.university || certifications || doctor.medicalCouncilReg) && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#f0fff4' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#16a34a' }}>🎓 Education & Credentials</h4>
            {doctor.university && <p><strong>University:</strong> {doctor.university}</p>}
            {certifications && certifications.length > 0 && (
              <div>
                <strong>Certifications:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {certifications.map((cert, idx) => <li key={idx}>{cert}</li>)}
                </ul>
              </div>
            )}
            {doctor.medicalCouncilReg && <p><strong>Medical Council Registration:</strong> {doctor.medicalCouncilReg}</p>}
          </div>
        )}

        {/* Expertise */}
        {(conditionsTreated || keyProcedures || specialInterests) && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#fff7ed' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ea580c' }}>🔬 Expertise</h4>
            {conditionsTreated && conditionsTreated.length > 0 && (
              <div>
                <strong>Conditions Treated:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {conditionsTreated.map((condition, idx) => <li key={idx}>{condition}</li>)}
                </ul>
              </div>
            )}
            {keyProcedures && keyProcedures.length > 0 && (
              <div>
                <strong>Key Procedures:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {keyProcedures.map((procedure, idx) => <li key={idx}>{procedure}</li>)}
                </ul>
              </div>
            )}
            {specialInterests && specialInterests.length > 0 && (
              <div>
                <strong>Special Interests:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {specialInterests.map((interest, idx) => <li key={idx}>{interest}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        {(awards || publications || memberships) && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#fef3c7' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>🏆 Achievements</h4>
            {awards && awards.length > 0 && (
              <div>
                <strong>Awards:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {awards.map((award, idx) => <li key={idx}>{award}</li>)}
                </ul>
              </div>
            )}
            {publications && publications.length > 0 && (
              <div>
                <strong>Publications:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {publications.map((pub, idx) => <li key={idx}>{pub}</li>)}
                </ul>
              </div>
            )}
            {memberships && memberships.length > 0 && (
              <div>
                <strong>Memberships:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {memberships.map((membership, idx) => <li key={idx}>{membership}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Patient Care */}
        {(doctor.consultationType || languagesSpoken || doctor.carePhilosophy || doctor.successStories) && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#f3e8ff' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#7c3aed' }}>💙 Patient Care</h4>
            {doctor.consultationType && <p><strong>Consultation Type:</strong> {doctor.consultationType}</p>}
            {languagesSpoken && languagesSpoken.length > 0 && (
              <p><strong>Languages Spoken:</strong> {languagesSpoken.join(', ')}</p>
            )}
            {doctor.carePhilosophy && (
              <div>
                <strong>Care Philosophy:</strong>
                <p style={{ fontStyle: 'italic', margin: '0.5rem 0', color: '#6b46c1' }}>"{doctor.carePhilosophy}"</p>
              </div>
            )}
            {doctor.successStories && (
              <div>
                <strong>Success Stories:</strong>
                <p style={{ margin: '0.5rem 0', color: '#6b46c1' }}>{doctor.successStories}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileView;
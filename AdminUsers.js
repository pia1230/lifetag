
import React, { useEffect, useState } from "react";
import apiClient from "../../api";
import "./AdminDashboard.css";

export default function AdminUsers() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = await apiClient.get("/admin/users?role=patient");
      const d = await apiClient.get("/admin/users?role=doctor");
      setPatients(p.data.users || []);
      setDoctors(d.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (id, role) => {
    await apiClient.post('/admin/verify-user', { userId: id, role });
    fetchData();
  };

  const suspendUser = async (id, role) => {
    await apiClient.post('/admin/suspend', { userId: id, role });
    fetchData();
  };

  const unsuspendUser = async (id, role) => {
    await apiClient.post('/admin/unsuspend', { userId: id, role });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page-wrapper">
      <h2 className="page-header">Manage Users</h2>

      <div className="section">
        <h3>Patients</h3>
        <div className="records-list-container">
          {loading && <p>Loading...</p>}
          {patients.map((p) => (
            <div key={p.id} className="record-card">
              <p><strong>{p.fullName}</strong> <span style={{opacity:0.7}}>#{p.id}</span></p>
              <p><small>{p.email}</small></p>
              <p><strong>Aadhaar:</strong> {p.aadhaarVerified ? 'Verified' : 'Not Verified'}</p>
              <p><strong>Status:</strong> {p.isBlocked ? 'Suspended' : 'Active'}</p>

              <div className="card-actions">
                <button className="primary-button" onClick={() => verifyUser(p.id, 'patient')}>VERIFY</button>
                {p.isBlocked ? (
                  <button className="primary-button" onClick={() => unsuspendUser(p.id, 'patient')}>UNSUSPEND</button>
                ) : (
                  <button className="danger-button" onClick={() => suspendUser(p.id, 'patient')}>SUSPEND</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section" style={{ marginTop: 20 }}>
        <h3>Doctors</h3>
        <div className="records-list-container">
          {doctors.map((d) => (
            <div key={d.id} className="record-card">
              <p><strong>{d.fullName}</strong> <span style={{opacity:0.7}}>#{d.id}</span></p>
              <p><small>{d.email}</small></p>
              <p><strong>Verified:</strong> {d.regVerified ? 'Yes' : 'No'}</p>
              <p><strong>Status:</strong> {d.isBlocked ? 'Suspended' : 'Active'}</p>

              <div className="card-actions">
                <button className="primary-button" onClick={() => verifyUser(d.id, 'doctor')}>VERIFY</button>
                {d.isBlocked ? (
                  <button className="primary-button" onClick={() => unsuspendUser(d.id, 'doctor')}>UNSUSPEND</button>
                ) : (
                  <button className="danger-button" onClick={() => suspendUser(d.id, 'doctor')}>SUSPEND</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

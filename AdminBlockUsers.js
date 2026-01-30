// src/pages/admin/AdminBlockUsers.js
import React, { useEffect, useState } from "react";
import apiClient from "../../api";

const AdminBlockUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("patient");

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(`/admin/users?role=${role}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      alert("Error loading users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const blockUser = async (userId) => {
    try {
      await apiClient.post("/admin/suspend", { userId, role });
      fetchUsers();
    } catch (err) {
      alert("Failed to suspend user");
    }
  };

  const unblockUser = async (userId) => {
    try {
      await apiClient.post("/admin/unsuspend", { userId, role });
      fetchUsers();
    } catch (err) {
      alert("Failed to unsuspend user");
    }
  };

  return (
    <div className="page-wrapper">
      <h2 className="page-header">Manage Users</h2>

      <select
        className="modern-input"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="patient">Patients</option>
        <option value="doctor">Doctors</option>
      </select>

      <div className="records-list-container" style={{ marginTop: "20px" }}>
        {users.map((u) => (
          <div key={u.id} className="record-card">
            <p><b>Name:</b> {u.fullName}</p>
            <p><b>Email:</b> {u.email}</p>
            <p><b>Status:</b> {u.isBlocked ? "Suspended ❌" : "Active ✅"}</p>

            {u.isBlocked ? (
              <button className="primary-button" onClick={() => unblockUser(u.id)}>
                UNSUSPEND
              </button>
            ) : (
              <button className="danger-button" onClick={() => blockUser(u.id)}>
                SUSPEND
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlockUsers;

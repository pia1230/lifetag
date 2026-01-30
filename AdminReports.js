import React, { useEffect, useState } from "react";
import apiClient from "../../api";
import "./AdminDashboard.css";

export default function AdminReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    apiClient.get("/admin/reports").then((res) => {
      setReports(res.data.reports || []);
    });
  }, []);

  return (
    <div className="page-wrapper">
      <h2 className="page-header">User Reports</h2>

      <div className="records-list-container">
        {reports.map((r) => (
          <div key={r.id} className="record-card">
            <p><strong>Reporter:</strong> {r.reporterId} ({r.reporterRole})</p>
            <p><strong>Reported User:</strong> {r.reportedUserId} ({r.reportedUserRole})</p>
            <p><strong>Reason:</strong> {r.reason}</p>
            <p style={{opacity:0.7, fontSize:13}}>Report ID: {r.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

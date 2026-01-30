// src/components/DoctorRequests.js
import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../api";
import { useAuth } from "./context/AuthContext";
import { useDataRefresh } from "./context/DataRefreshContext";
import "./DoctorRequests.css";
import "./RefreshStyles.css";
import CountdownTimer from "./CountdownTimer";

const DoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const { refreshTriggers } = useDataRefresh();

  const fetchRequests = useCallback(async () => {
    if (!auth?.token || !auth?.id) {
      if (loading) {
        setLoading(false);
        setError("User not authenticated.");
      }
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/access/doctor/${auth.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const activeRequests = response.data.filter(
        (req) => req.status === "pending" || req.status === "approved"
      );
      setRequests(activeRequests);
      setError(null);
    } catch (err) {
      console.error("Error fetching requests:", err);
      const newError = err.response?.data?.message || "Failed to fetch requests.";
      if (error !== newError) {
        setError(newError);
      }
    } finally {
      setLoading(false);
    }
  }, [auth?.token, auth?.id, error, loading]);

  useEffect(() => {
    fetchRequests();
    
    // Set up polling every 3 seconds for immediate updates
    const intervalId = setInterval(fetchRequests, 3000);
    
    // Listen for custom refresh events
    const handleForceRefresh = () => {
      console.log('Force refresh triggered for requests');
      fetchRequests();
    };
    
    window.addEventListener('forceDataRefresh', handleForceRefresh);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('forceDataRefresh', handleForceRefresh);
    };
  }, [fetchRequests]);

  // Listen for refresh triggers
  useEffect(() => {
    if (refreshTriggers.requests > 0) {
      fetchRequests();
    }
  }, [refreshTriggers.requests, fetchRequests]);

  const handleRefresh = () => {
    fetchRequests();
  };

  if (loading && requests.length === 0) {
    return <p>Loading requests...</p>;
  }

  if (error && requests.length === 0) {
    return (
      <div>
        <p className="error-message">{error}</p>
        <button onClick={handleRefresh} className="refresh-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header-container">
        <h2 className="page-header">My Sent Requests</h2>
        <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>
      )}

      {requests.length === 0 ? (
        <p>You have no active or pending requests.</p>
      ) : (
        <div className="doctor-requests-list">
          {requests.map((req) => (
            <div key={req.id} className="doctor-request-item">
              <div className="request-details">
                <strong>Patient ID: {req.Patient ? req.Patient.patientTagId : 'N/A'}</strong>
                <span>Name: {req.Patient ? req.Patient.fullName : 'Unknown Patient'}</span>
                <span className="notes">Notes: "{req.notes || "N/A"}"</span>
              </div>
              <div className="request-status">
                {req.status === "approved" && req.expiresAt ? (
                  <CountdownTimer
                    expiresAt={req.expiresAt}
                    onExpire={fetchRequests}
                  />
                ) : (
                  <span className={`status-badge status-${req.status}`}>
                    {req.status}
                  </span>
                )}
                <span className="request-date">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DoctorRequests;

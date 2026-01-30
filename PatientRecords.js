// src/components/PatientRecords.js
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useAuth } from './context/AuthContext';
import { useDataRefresh } from './context/DataRefreshContext';
import './PatientRecords.css';
import './RefreshStyles.css';
import FileViewerModal from './FileViewerModal';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const { refreshTriggers } = useDataRefresh();
  
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Create a memoized fetch function
  const fetchRecords = useCallback(async () => {
    if (!auth?.token) {
      setLoading(false);
      setError('No authentication token found.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiClient.get('/records/patient', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setRecords(response.data);
      setError(null);
      console.log('Records refreshed:', response.data.length, 'records found');
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.response?.data?.message || 'Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchRecords();
    
    // Set up polling every 5 seconds for immediate updates
    const interval = setInterval(fetchRecords, 5000);
    
    // Listen for custom refresh events
    const handleForceRefresh = () => {
      console.log('Force refresh triggered');
      fetchRecords();
    };
    
    window.addEventListener('forceDataRefresh', handleForceRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('forceDataRefresh', handleForceRefresh);
    };
  }, [fetchRecords]);

  // Listen for refresh triggers
  useEffect(() => {
    if (refreshTriggers.records > 0) {
      fetchRecords();
    }
  }, [refreshTriggers.records, fetchRecords]);

  // Add a manual refresh function
  const handleRefresh = () => {
    fetchRecords();
  };

  if (loading && records.length === 0) {
    return <p>Loading records...</p>;
  }

  if (error && records.length === 0) {
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
        <h2 className="page-header">My Medical Records</h2>
        <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
      
      {error && (
        <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>
      )}
      
      {records.length === 0 ? (
        <p>No medical records found.</p>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div 
              key={record.id} 
              className="record-item clickable"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="record-icon">📄</div>
              <div className="record-details">
                <strong>{record.fileName}</strong>
                <span>Type: {record.recordType || 'N/A'}</span>
                <span>Uploaded by: {record.doctor?.fullName || record.Doctor?.fullName || 'Unknown'}</span>
              </div>
              <div className="record-date">
                {new Date(record.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecord && (
        <FileViewerModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </>
  );
};

export default PatientRecords;
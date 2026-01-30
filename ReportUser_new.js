import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import apiClient from "../api";
import "./Login.css";

const ReportUser = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetRole = searchParams.get("targetRole") || "";
  const [reportedId, setReportedId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!reportedId || !reason || !targetRole) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await apiClient.post("/reports", {
        reportedUserId: parseInt(reportedId),
        reportedUserRole: targetRole,
        reason,
      });

      setSuccess(true);
      setReportedId("");
      setReason("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="title">
          Report{" "}
          {targetRole ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1) : "User"}
        </h2>

        {success && (
          <div
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ✓ Report submitted successfully! Redirecting...
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>User ID</label>
          <input
            type="number"
            className="modern-input"
            value={reportedId}
            onChange={(e) => setReportedId(e.target.value)}
            placeholder="Enter user ID"
            required
          />

          <label>Reason for Report</label>
          <textarea
            className="modern-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the reason for this report..."
            rows="5"
            required
            style={{ resize: "vertical", minHeight: "120px" }}
          />

          <button
            type="submit"
            className="primary-button glossy-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportUser;

import React, { useState } from "react";
import axios from "../api";

function AadhaarVerification({ patientId, aadhaarVerified, onVerified }) {
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState(""); // prototype only

  // -------------------------
  // Send OTP
  // -------------------------
  const sendOtp = async () => {
    if (aadhaar.length !== 12) {
      alert("Enter a valid 12-digit Aadhaar number");
      return;
    }

    try {
      const res = await axios.post("/users/aadhaar/send-otp", {
        patientId,
        aadhaarNumber: aadhaar,
      });

      setOtpSent(true);
      setServerOtp(res.data.otp); // prototype only
      alert("OTP sent! (In prototype mode, check the screen)");

    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  // -------------------------
  // Verify OTP
  // -------------------------
  const verifyOtp = async () => {
    try {
      const res = await axios.post("/users/aadhaar/verify", {
        patientId,
        otp,
      });

      alert("Aadhaar Verified Successfully!");
      onVerified(); // to refresh parent page

    } catch (err) {
      alert(err?.response?.data?.message || "Verification Failed");
    }
  };

  return (
    <div className="aadhaar-box">
      <h3>Aadhaar Verification</h3>

      {aadhaarVerified ? (
        <p style={{ color: "lightgreen", fontWeight: "bold" }}>
          ✔ Verified
        </p>
      ) : (
        <p style={{ color: "#ff4444", fontWeight: "bold" }}>
          ✖ Not Verified
        </p>
      )}

      {!aadhaarVerified && (
        <>
          {/* Aadhaar Input */}
          <input
            type="text"
            placeholder="Enter 12-digit Aadhaar"
            maxLength="12"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            className="modern-input"
          />

          {/* SEND OTP BUTTON */}
          <button className="primary-button" onClick={sendOtp}>
            Send OTP
          </button>

          {/* SHOW OTP (prototype only) */}
          {otpSent && (
            <p style={{ color: "yellow" }}>
              Prototype OTP: <b>{serverOtp}</b>
            </p>
          )}

          {otpSent && (
            <>
              {/* OTP Input */}
              <input
                type="text"
                placeholder="Enter OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="modern-input"
              />

              {/* VERIFY BUTTON */}
              <button className="primary-button" onClick={verifyOtp}>
                Verify Aadhaar
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default AadhaarVerification;

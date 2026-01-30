const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");

// -----------------------------
// TEMP IN-MEMORY OTP STORE (Prototype)
// -----------------------------
const otpStore = {};   // RESET when server restarts — OK for prototype only

// =====================================================
// 1️⃣ PATIENT AADHAAR VERIFICATION (Prototype)
// =====================================================

// ---- Step 1: Generate and send OTP ----
router.post("/aadhaar/send-otp", async (req, res) => {
  const { aadhaarNumber, patientId } = req.body;

  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return res.status(400).json({ message: "Invalid Aadhaar number format" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[patientId] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  res.json({
    message: "OTP sent (Prototype Mode)",
    otp // Only for prototype — NEVER in production
  });
});

// ---- Step 2: Verify OTP ----
router.post("/aadhaar/verify", async (req, res) => {
  const { otp, patientId, aadhaarNumber } = req.body;

  const record = otpStore[patientId];
  if (!record) {
    return res.status(400).json({ message: "OTP not generated" });
  }

  if (Date.now() > record.expires) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otp != record.otp) {
    return res.status(400).json({ message: "Incorrect OTP" });
  }

  // Store only last 4 digits → safe
  const last4 = aadhaarNumber.slice(-4);

  await Patient.update(
    {
      aadhaarVerified: true,
      aadhaarLast4: last4
    },
    { where: { id: patientId } }
  );

  delete otpStore[patientId];

  res.json({ message: "Aadhaar verified successfully" });
});

// =====================================================
// 2️⃣ DOCTOR REGISTRATION NUMBER VERIFICATION (Prototype)
// =====================================================
router.post(
  "/doctor/verify-registration",
  authMiddleware(["doctor"]),
  async (req, res) => {
    try {
      const { registrationNumber } = req.body;

      if (!registrationNumber) {
        return res.status(400).json({ message: "Registration number required" });
      }

      // Prototype validation pattern
      const validPattern = /^[A-Za-z0-9\-\/]+$/;

      if (!validPattern.test(registrationNumber)) {
        return res.status(400).json({
          message: "Invalid registration number format (Example: MMC/12345)"
        });
      }

      // Hash the number for safety
      const hashed = await bcrypt.hash(registrationNumber, 10);

      await Doctor.update(
        {
          registrationNumberHashed: hashed,
          regVerified: true
        },
        { where: { id: req.user.id } }
      );

      res.json({
        message: "Doctor registration verified successfully (prototype)"
      });
    } catch (err) {
      console.error("Doctor registration verify error:", err);
      res.status(500).json({ message: "Registration verification failed" });
    }
  }
);

module.exports = router;

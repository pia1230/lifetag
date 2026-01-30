// backend/routes/userRoutes.js
const express = require("express");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { Patient } = require("../models");

require("dotenv").config();

const router = express.Router();

// ------------------------------------------
//  Generate lifetime Health ID (simple proto)
// ------------------------------------------
function generatePatientTagId() {
  return Math.floor(100000000 + Math.random() * 900000000); // 9-digit ID
}

// Temporary OTP store (prototype only)
const otpStore = {};

// ------------------------------------------
//             REGISTER
// ------------------------------------------
router.post("/register", async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { fullName, email, password, age, gender, role, department, govId, accessLevel } = req.body;

    if (!fullName || !email || !password) {
      console.log('Missing required fields:', { fullName: !!fullName, email: !!email, password: !!password });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Government registration validation
    if (role === 'government') {
      if (!department || !govId || !accessLevel) {
        return res.status(400).json({ message: "All government fields are required" });
      }
      if (!/^\d{10}$/.test(govId)) {
        return res.status(400).json({ message: "Government ID must be exactly 10 digits" });
      }
    }

    // Check duplicate email
    const exists = await Patient.findOne({ where: { email } });
    if (exists) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const patientTagId = role === 'government' ? 999999999 : generatePatientTagId();

    const patient = await Patient.create({
      fullName,
      email,
      password: hashed,
      age: age || null,
      gender: gender || null,
      patientTagId,
      role: role || 'patient'
    });

    console.log('User registered successfully:', { id: patient.id, patientTagId, role: role || 'patient' });
    
    if (role === 'government') {
      res.status(201).json({
        message: "Government registration successful",
        adminId: patient.id,
        note: "You can now login with admin credentials"
      });
    } else {
      res.status(201).json({
        message: "Patient registered successfully",
        patientId: patient.id,
        patientTagId: patient.patientTagId,
      });
    }

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});

// ------------------------------------------
//                LOGIN

// Patient/Admin login
router.post("/login", async (req, res) => {
  try {
    console.log('Patient login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ========== HARDCODED ADMIN CHECK ==========
    if (email === "admin@lifetag.com" && password === "admin123") {
      const token = jwt.sign(
        { id: 0, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      console.log('Admin login successful');
      return res.json({
        message: "Admin login successful",
        token,
        adminId: 0,  // Virtual admin ID
      });
    }
    // ========================================

    // Patient/Government lookup
    const patient = await Patient.findOne({ where: { email } });
    if (!patient) {
      console.log('User not found:', email);
      return res.status(404).json({ message: "User not found" });
    }

    // 🚨 Block protection
    if (patient.isBlocked) {
      console.log('User is blocked:', email);
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    const ok = await bcrypt.compare(password, patient.password);
    if (!ok) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine user role
    const userRole = patient.role === 'government' ? 'admin' : 'patient';
    
    const token = jwt.sign(
      { id: patient.id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('User login successful:', { id: patient.id, role: userRole, patientTagId: patient.patientTagId });
    
    if (patient.role === 'government') {
      res.json({
        message: "Government login successful",
        token,
        adminId: patient.id
      });
    } else {
      res.json({
        message: "Login successful",
        token,
        patientId: patient.id,
        patientTagId: patient.patientTagId,
        aadhaarVerified: patient.aadhaarVerified
      });
    }
  } catch (err) {
    console.error("Patient login error:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});


// ------------------------------------------
//        Aadhaar — Send OTP (Prototype)
// ------------------------------------------
router.post("/aadhaar/send-otp", async (req, res) => {
  const { aadhaarNumber, patientId } = req.body;

  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return res.status(400).json({ message: "Invalid Aadhaar format" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[patientId] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
    aadhaarNumber,
  };

  res.json({
    message: "OTP sent (Prototype mode)",
    otp, // NOTE: Only shown for demo
  });
});

// ------------------------------------------
//           Aadhaar — Verify OTP
// ------------------------------------------
router.post("/aadhaar/verify", async (req, res) => {
  const { patientId, otp } = req.body;

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

  const last4 = record.aadhaarNumber.slice(-4);

  await Patient.update(
    { aadhaarVerified: true, aadhaarLast4: last4 },
    { where: { id: patientId } }
  );

  delete otpStore[patientId];

  res.json({
    message: "Aadhaar verified successfully",
    last4,
  });
});

// ------------------------------------------
//        GET PATIENT PROFILE
// ------------------------------------------
router.get("/profile", authMiddleware(["patient"]), async (req, res) => {
    try {
      const patient = await Patient.findByPk(req.user.id);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json({
        id: patient.id,
        fullName: patient.fullName,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        patientTagId: patient.patientTagId,
        aadhaarVerified: patient.aadhaarVerified,
        aadhaarLast4: patient.aadhaarLast4,
        isBlocked: patient.isBlocked,
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

module.exports = router;

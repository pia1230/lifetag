const express = require("express");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Admin, Patient, Doctor, Report } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

require("dotenv").config();


const router = express.Router();

// ================================
//  GOVERNMENT REGISTRATION
// ================================
router.post("/register", async (req, res) => {
  try {
    console.log('Government registration attempt:', req.body);
    const { fullName, email, password, department, govId, accessLevel } = req.body;

    if (!fullName || !email || !password || !department || !govId || !accessLevel) {
      return res.status(400).json({ message: "All government fields are required" });
    }

    // Validate government credentials
    if (department !== 'health-ministry') {
      return res.status(400).json({ message: "Invalid department" });
    }

    if (!/^\d{10}$/.test(govId)) {
      return res.status(400).json({ message: "Government ID must be exactly 10 digits" });
    }

    // Check if email already exists
    const existingPatient = await Patient.findOne({ where: { email } });
    const existingDoctor = await Doctor.findOne({ where: { email } });
    
    if (existingPatient || existingDoctor) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // For now, we'll create a special admin patient record
    const hashed = await bcrypt.hash(password, 10);
    
    const adminUser = await Patient.create({
      fullName,
      email,
      password: hashed,
      patientTagId: 999999999, // Special admin tag
      role: 'admin',
      isBlocked: false
    });

    console.log('Government user registered:', { id: adminUser.id, email });
    res.status(201).json({
      message: "Government registration successful",
      adminId: adminUser.id,
      message2: "You can now login with admin credentials"
    });

  } catch (err) {
    console.error("Government registration error:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded admin credentials for now
    if (email === "admin@lifetag.com" && password === "admin123") {
      const token = jwt.sign(
        { id: 0, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Admin login successful",
        token,
        adminId: 0,
      });
    } else {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  GOVERNMENT DASHBOARD STATS
// ================================
router.get("/stats", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { MedicalRecord, AccessRequest } = require("../models");
    
    const totalPatients = await Patient.count();
    const totalDoctors = await Doctor.count();
    const totalRecords = await MedicalRecord.count();
    const totalAccessRequests = await AccessRequest.count();
    const blockedPatients = await Patient.count({ where: { isBlocked: true } });
    const blockedDoctors = await Doctor.count({ where: { isBlocked: true } });

    res.json({
      totalPatients,
      totalDoctors,
      totalRecords,
      totalAccessRequests,
      blockedUsers: blockedPatients + blockedDoctors
    });
  } catch (err) {
    console.error("Government stats error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  GOVERNMENT RECENT ACTIVITY
// ================================
router.get("/recent-activity", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { MedicalRecord, AccessRequest } = require("../models");
    
    const recentRecords = await MedicalRecord.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["fullName"] }, { model: Doctor, attributes: ["fullName"] }]
    });

    const recentRequests = await AccessRequest.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: Patient, attributes: ["fullName"] }, { model: Doctor, attributes: ["fullName"] }]
    });

    const activity = [
      ...recentRecords.map(record => ({
        icon: "📋",
        action: "Medical Record Uploaded",
        details: `${record.Doctor?.fullName || 'Patient'} uploaded record for ${record.Patient?.fullName}`,
        timestamp: record.createdAt
      })),
      ...recentRequests.map(request => ({
        icon: "🔐",
        action: "Access Request",
        details: `Dr. ${request.Doctor?.fullName} requested access to ${request.Patient?.fullName}'s records`,
        timestamp: request.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json(activity);
  } catch (err) {
    console.error("Recent activity error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  ADMIN GET ALL USERS (Patients or Doctors)
// ================================
router.get("/users", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { role } = req.query;

    if (!role || !["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid or missing role parameter" });
    }

    let users = [];
    if (role === "patient") {
      users = await Patient.findAll({
        attributes: { exclude: ["password"] }
      });
    } else if (role === "doctor") {
      // Parse JSON fields for comprehensive doctor profiles
      const doctors = await Doctor.findAll({
        attributes: { exclude: ["password", "registrationNumberHashed"] }
      });
      
      users = doctors.map(doctor => {
        const parseJSON = (field) => {
          try {
            if (!field) return [];
            if (typeof field === 'string') {
              return JSON.parse(field);
            }
            if (Array.isArray(field)) {
              return field;
            }
            return [];
          } catch {
            return [];
          }
        };
        
        return {
          ...doctor.toJSON(),
          certifications: parseJSON(doctor.certifications),
          conditionsTreated: parseJSON(doctor.conditionsTreated),
          keyProcedures: parseJSON(doctor.keyProcedures),
          specialInterests: parseJSON(doctor.specialInterests),
          previousHospitals: parseJSON(doctor.previousHospitals),
          academicRoles: parseJSON(doctor.academicRoles),
          workshopsAttended: parseJSON(doctor.workshopsAttended),
          awards: parseJSON(doctor.awards),
          publications: parseJSON(doctor.publications),
          memberships: parseJSON(doctor.memberships),
          languagesSpoken: parseJSON(doctor.languagesSpoken)
        };
      });
    }

    res.json({ users });
  } catch (err) {
    console.error("Fetch users error:", err);
    return res.status(500).json({ message: "Internal Error" });
  }
});

// ================================
//  ADMIN VIEW ALL REPORTS
// ================================
router.get("/reports", authMiddleware(["admin"]), async (req, res) => {
  try {
    const reports = await Report.findAll();
    return res.json({ reports });
  } catch (err) {
    console.error("Fetch reports error:", err);
    return res.status(500).json({ message: "Internal Error" });
  }
});


// ================================
//  ADMIN BLOCK A USER
// ================================
router.post("/block", authMiddleware(["admin"]), async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    if (role === "patient") {
      await Patient.update({ isBlocked: true }, { where: { id: userId } });
    } else if (role === "doctor") {
      await Doctor.update({ isBlocked: true }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: "Role not supported" });
    }

    return res.json({ message: `${role} blocked successfully` });
  } catch (err) {
    console.error("Block error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  ADMIN UNBLOCK A USER
// ================================
router.post("/unblock", authMiddleware(["admin"]), async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    if (role === "patient") {
      await Patient.update({ isBlocked: false }, { where: { id: userId } });
    } else if (role === "doctor") {
      await Doctor.update({ isBlocked: false }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: "Role not supported" });
    }

    return res.json({ message: `${role} unblocked successfully` });
  } catch (err) {
    console.error("Unblock error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
// ADMIN SEARCH USERS
router.get("/search", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.json({ results: [] });

    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          { id: query },
          { email: query },
          { fullName: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });

    const doctors = await Doctor.findAll({
      where: {
        [Op.or]: [
          { id: query },
          { email: query },
          { fullName: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });

    res.json({ results: [...patients, ...doctors] });
  } catch (err) {
    console.error("search error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// ADMIN GET FULL USER PROFILE
router.get("/user", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { id, role } = req.query;

    if (!id || !role)
      return res.status(400).json({ message: "Missing parameters" });

    let user =
      role === "patient"
        ? await Patient.findByPk(id)
        : role === "doctor"
        ? await Doctor.findByPk(id)
        : null;

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ message: "Internal Error" });
  }
});

// ================================
//  VERIFY USER (doctor -> regVerified, patient -> aadhaarVerified)
// ================================
router.post('/verify-user', authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'Missing parameters' });

    if (role === 'doctor') {
      await Doctor.update({ regVerified: true }, { where: { id: userId } });
    } else if (role === 'patient') {
      await Patient.update({ aadhaarVerified: true }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    return res.json({ message: 'User verified successfully' });
  } catch (err) {
    console.error('Verify user error:', err);
    return res.status(500).json({ message: 'Internal Error' });
  }
});

// ================================
//  SUSPEND USER (isBlocked = true)
// ================================
router.post('/suspend', authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'Missing parameters' });

    if (role === 'patient') {
      await Patient.update({ isBlocked: true }, { where: { id: userId } });
    } else if (role === 'doctor') {
      await Doctor.update({ isBlocked: true }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    return res.json({ message: 'User suspended successfully' });
  } catch (err) {
    console.error('Suspend user error:', err);
    return res.status(500).json({ message: 'Internal Error' });
  }
});

// ================================
//  UNSUSPEND USER (isBlocked = false)
// ================================
router.post('/unsuspend', authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'Missing parameters' });

    if (role === 'patient') {
      await Patient.update({ isBlocked: false }, { where: { id: userId } });
    } else if (role === 'doctor') {
      await Doctor.update({ isBlocked: false }, { where: { id: userId } });
    } else {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    return res.json({ message: 'User unsuspended successfully' });
  } catch (err) {
    console.error('Unsuspend user error:', err);
    return res.status(500).json({ message: 'Internal Error' });
  }
});



module.exports = router;

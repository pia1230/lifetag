// backend/routes/doctorRoutes.js
const express = require("express");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// ---- Allowed Degrees ----
const allowedDegrees = [
  "MBBS",
  "BAMS",
  "BHMS",
  "BUMS",
  "BSMS",
  "BNYS",
  "BDS"
];

// ---- Degree → Specialization Map ----
const specializationMap = {
  MBBS: [
    "General Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology",
    "Orthopedics", "Dermatology", "Ophthalmology", "ENT", "Psychiatry",
    "Anesthesiology", "Radiology", "Pathology", "Community Medicine",
    "Family Medicine", "Emergency Medicine", "Cardiology", "Neurology",
    "Nephrology", "Gastroenterology", "Endocrinology",
    "Pulmonology", "Hepatology", "Oncology",
    "Plastic Surgery", "Neurosurgery", "Urology"
  ],

  BAMS: ["Kayachikitsa", "Panchakarma", "Shalya Tantra", "Shalakya Tantra"],
  BHMS: ["Homeopathic Repertory", "Materia Medica", "Organon of Medicine"],
  BUMS: ["Ilmul Advia", "Ilmul Amraz", "Moalijat"],
  BSMS: ["Siddha General Medicine", "Siddha Pharmacology"],
  BNYS: ["Yoga Therapy", "Naturopathy Medicine"],
  BDS: [
    "Oral Medicine & Radiology", "Oral & Maxillofacial Surgery",
    "Orthodontics", "Periodontology", "Prosthodontics",
    "Pedodontics", "Endodontics"
  ]
};

// ================================
//          REGISTER
// ================================
router.post("/register", async (req, res) => {
  try {
    console.log('Doctor registration attempt:', req.body);
    const { 
      fullName, email, password, degree, specialization, hospital,
      medicalTitle, department, yearsOfExperience, university,
      certifications, medicalCouncilReg, conditionsTreated,
      keyProcedures, specialInterests, previousHospitals,
      academicRoles, workshopsAttended, awards, publications,
      memberships, consultationType, languagesSpoken,
      carePhilosophy, successStories
    } = req.body;

    if (!fullName || !email || !password || !degree || !specialization) {
      console.log('Missing required fields:', { fullName: !!fullName, email: !!email, password: !!password, degree: !!degree, specialization: !!specialization });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate degree
    if (!allowedDegrees.includes(degree)) {
      console.log('Invalid degree:', degree);
      return res.status(400).json({ message: "Invalid medical degree" });
    }

    // Validate specialization belongs to degree
    if (!specializationMap[degree].includes(specialization)) {
      console.log('Invalid specialization for degree:', { degree, specialization });
      return res.status(400).json({
        message: `Specialization '${specialization}' is not valid for degree '${degree}'`
      });
    }

    // Check existing email
    const existing = await Doctor.findOne({ where: { email } });
    if (existing) {
      console.log('Doctor email already exists:', email);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      fullName,
      email,
      password: hashed,
      degree,
      specialization,
      hospital: hospital || null,
      medicalTitle: medicalTitle || null,
      department: department || null,
      yearsOfExperience: yearsOfExperience || null,
      university: university || null,
      certifications: certifications ? JSON.stringify(certifications) : null,
      medicalCouncilReg: medicalCouncilReg || null,
      conditionsTreated: conditionsTreated ? JSON.stringify(conditionsTreated) : null,
      keyProcedures: keyProcedures ? JSON.stringify(keyProcedures) : null,
      specialInterests: specialInterests ? JSON.stringify(specialInterests) : null,
      previousHospitals: previousHospitals ? JSON.stringify(previousHospitals) : null,
      academicRoles: academicRoles ? JSON.stringify(academicRoles) : null,
      workshopsAttended: workshopsAttended ? JSON.stringify(workshopsAttended) : null,
      awards: awards ? JSON.stringify(awards) : null,
      publications: publications ? JSON.stringify(publications) : null,
      memberships: memberships ? JSON.stringify(memberships) : null,
      consultationType: consultationType || null,
      languagesSpoken: languagesSpoken ? JSON.stringify(languagesSpoken) : null,
      carePhilosophy: carePhilosophy || null,
      successStories: successStories || null
    });

    console.log('Doctor registered successfully:', { id: doctor.id, email: doctor.email });
    return res.status(201).json({
      message: "Doctor registered successfully",
      doctorId: doctor.id
    });

  } catch (err) {
    console.error("Doctor register error:", err);
    return res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});

// ================================
//          LOGIN
// ================================
// Doctor login
router.post("/login", async (req, res) => {
  try {
    console.log('Doctor login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) {
      console.log('Doctor not found:', email);
      return res.status(404).json({ message: "Doctor not found" });
    }

    // 🚨 Block protection
    if (doctor.isBlocked) {
      console.log('Doctor is blocked:', email);
      return res.status(403).json({ message: "Your account is blocked by admin." });
    }

    // 🚨 Verification check
    if (!doctor.regVerified) {
      console.log('Doctor not verified:', email);
      return res.status(403).json({ message: "Your account is pending government verification. Please wait for approval." });
    }

    const ok = await bcrypt.compare(password, doctor.password);
    if (!ok) {
      console.log('Invalid password for doctor:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor.id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('Doctor login successful:', { id: doctor.id, email: doctor.email });
    res.json({ message: "Login successful", token, doctorId: doctor.id });

  } catch (err) {
    console.error("Doctor login error:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});


// ================================
//   SUBMIT REGISTRATION NUMBER
// ================================
router.post("/submit-reg", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    if (!registrationNumber) {
      return res.status(400).json({ message: "Registration number required" });
    }

    const doctor = await Doctor.findByPk(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.regVerified === true) {
      return res.status(400).json({ message: "Already verified" });
    }

    // Hash reg number so we never store it
    const hashedReg = await bcrypt.hash(registrationNumber, 10);

    doctor.registrationNumberHashed = hashedReg;
    await doctor.save();

    return res.json({ message: "Registration number submitted successfully" });

  } catch (err) {
    console.error("Submit reg no error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//  CHECK VERIFICATION STATUS
// ================================
router.get("/verify-status", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      regVerified: doctor.regVerified
    });

  } catch (err) {
    console.error("Verification check error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
//   GET DOCTOR PROFILE
// ================================
router.get("/profile", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Parse JSON fields
    const parseJSON = (field) => {
      try {
        return field ? JSON.parse(field) : null;
      } catch {
        return null;
      }
    };

    res.json({
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        medicalTitle: doctor.medicalTitle,
        email: doctor.email,
        degree: doctor.degree,
        specialization: doctor.specialization,
        department: doctor.department,
        yearsOfExperience: doctor.yearsOfExperience,
        hospital: doctor.hospital,
        university: doctor.university,
        certifications: parseJSON(doctor.certifications),
        medicalCouncilReg: doctor.medicalCouncilReg,
        conditionsTreated: parseJSON(doctor.conditionsTreated),
        keyProcedures: parseJSON(doctor.keyProcedures),
        specialInterests: parseJSON(doctor.specialInterests),
        previousHospitals: parseJSON(doctor.previousHospitals),
        academicRoles: parseJSON(doctor.academicRoles),
        workshopsAttended: parseJSON(doctor.workshopsAttended),
        awards: parseJSON(doctor.awards),
        publications: parseJSON(doctor.publications),
        memberships: parseJSON(doctor.memberships),
        consultationType: doctor.consultationType,
        languagesSpoken: parseJSON(doctor.languagesSpoken),
        carePhilosophy: doctor.carePhilosophy,
        successStories: doctor.successStories,
        regVerified: doctor.regVerified,
        isBlocked: doctor.isBlocked,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
        role: doctor.role
      },
    });
  } catch (err) {
    console.error("Doctor profile fetch error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

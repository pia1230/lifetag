const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new report (patient or doctor can report)
router.post("/", authMiddleware(["patient", "doctor"]), async (req, res) => {
  try {
    const { reportedUserId, reason, reportedUserRole } = req.body;

    if (!reportedUserId || !reason || !reportedUserRole) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      reporterRole: req.user.role,
      reportedUserId,
      reportedUserRole,
      reason
    });

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Error submitting report" });
  }
});

module.exports = router;

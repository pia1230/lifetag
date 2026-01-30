// backend/models/Doctor.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Basic Information
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    medicalTitle: {
      type: DataTypes.STRING,
      allowNull: true, // Dr., Prof., etc.
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Professional Information
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hospital: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Education & Credentials
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    certifications: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON string of certifications
    },
    medicalCouncilReg: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Expertise
    conditionsTreated: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    keyProcedures: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    specialInterests: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },

    // Professional Experience
    previousHospitals: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    academicRoles: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    workshopsAttended: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },

    // Achievements
    awards: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    publications: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    memberships: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },

    // Patient-Focused
    consultationType: {
      type: DataTypes.STRING,
      allowNull: true, // in-person, online, both
    },
    languagesSpoken: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON array
    },
    carePhilosophy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    successStories: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // System fields
    registrationNumberHashed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    regVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "doctor",
    },
  },
  {
    tableName: "doctors",
    timestamps: true,
  }
);

module.exports = Doctor;

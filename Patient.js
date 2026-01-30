// backend/models/Patient.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ✔ Unique lifelong Health ID
    patientTagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
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

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // 🔒 Prototype Aadhaar verification
    aadhaarVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    aadhaarLast4: {
      type: DataTypes.STRING(4),
      allowNull: true,
      validate: {
        isNumeric: true,
        len: [4, 4],
      },
    },

    // 🚨 NEW FIELD — Admin can block this patient
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // (Optional) self-identifying role (frontend may need this)
    role: {
      type: DataTypes.STRING,
      defaultValue: "patient",
    },
  },
  {
    tableName: "patients",
    timestamps: true,
  }
);

module.exports = Patient;

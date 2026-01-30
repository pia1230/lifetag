// backend/models/Report.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Report = sequelize.define("Report", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },

  reporterId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },

  reporterRole: { 
    type: DataTypes.ENUM("patient", "doctor"), 
    allowNull: false 
  },

  reportedUserId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },

  reportedUserRole: { 
    type: DataTypes.ENUM("patient", "doctor"), 
    allowNull: false 
  },

  reason: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },

  status: {
    type: DataTypes.ENUM("pending", "resolved"),
    defaultValue: "pending"
  },

  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "reports",
  timestamps: true
});

module.exports = Report;

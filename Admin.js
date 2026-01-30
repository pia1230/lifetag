// backend/models/Admin.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Admin = sequelize.define("Admin", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  fullName: { type: DataTypes.STRING, allowNull: false },

  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: { isEmail: true }
  },

  password: { type: DataTypes.STRING, allowNull: false },

  isSuper: { type: DataTypes.BOOLEAN, defaultValue: false },

  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: "admins",
  timestamps: true,
});

module.exports = Admin;

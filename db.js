
// backend/models/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Use SQLite for development
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});

module.exports = sequelize;

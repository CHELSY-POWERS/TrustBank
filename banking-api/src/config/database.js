const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

// In test mode we swap MySQL for an in-memory SQLite DB: same Sequelize
// models/associations/hooks run against it, but there's nothing to install,
// no network, and every test run starts from a clean slate. This is what
// lets `npm run test:integration` exercise the real routes -> controllers ->
// services -> models stack without a live MySQL server.
const sequelize = isTest
  ? new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

module.exports = sequelize;

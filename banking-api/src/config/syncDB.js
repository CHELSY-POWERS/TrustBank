require('dotenv').config();
const sequelize = require('./database');
require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized.');
    process.exit(0);
  } catch (err) {
    console.error('❌ DB sync failed:', err.message);
    process.exit(1);
  }
})();

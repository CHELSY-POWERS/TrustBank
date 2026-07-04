// Runs once before the test files are collected (see vitest.config.js -> setupFiles).
// Loads .env.test FIRST so that anything requiring src/config/database.js afterwards
// sees NODE_ENV=test and picks the in-memory SQLite branch instead of MySQL.
require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/models');

beforeAll(async () => {
  // force: true drops + recreates every table against the in-memory DB —
  // cheap because it's SQLite in RAM, and guarantees a clean schema per run.
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  // Isolation between tests (AAA-friendly): wipe all rows, keep the schema,
  // so one test's data can't leak into the next one.
  const models = sequelize.models;
  for (const name of Object.keys(models)) {
    await models[name].destroy({ where: {}, truncate: true, force: true });
  }
});

afterAll(async () => {
  await sequelize.close();
});

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (Frontend UI) ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ─── Swagger UI ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Banking API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// ─── API Routes ──────────────────────────────────────────────────────────────
const BASE = '/api/v1';
app.use(`${BASE}/auth`,         require('./routes/auth'));
app.use(`${BASE}/accounts`,     require('./routes/accounts'));
app.use(`${BASE}/transactions`, require('./routes/transactions'));
app.use(`${BASE}/admin`,        require('./routes/admin'));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() })
);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` })
);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
// Only auto-connect + listen when this file is run directly (`node src/app.js`
// or `npm start`). When it's `require()`d by tests (e.g. via supertest), we
// just want the configured `app` object with no side effects — the test
// setup file is responsible for its own (in-memory) DB connection.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ MySQL connected');
      await sequelize.sync({ alter: true });
      console.log('✅ Models synchronized');
      app.listen(PORT, () => {
        console.log(`🚀 Banking API running at http://localhost:${PORT}`);
        console.log(`📚 Swagger docs at  http://localhost:${PORT}/api-docs`);
      });
    } catch (err) {
      console.error('❌ Startup error:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = app;

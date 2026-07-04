const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,               // use describe/it/expect without importing them
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/config/**', 'src/app.js'],
    },
  },
});

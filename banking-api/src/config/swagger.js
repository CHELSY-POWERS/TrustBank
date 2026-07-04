const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banking API',
      version: '1.0.0',
      description: 'A comprehensive RESTful Banking API with authentication, accounts, transactions, and admin management.',
      contact: { name: 'Banking API Support' },
    },
    servers: [{ url: 'http://localhost:3000/api/v1', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['client', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            accountNumber: { type: 'string' },
            accountType: { type: 'string', enum: ['checking', 'savings'] },
            balance: { type: 'number', format: 'float' },
            currency: { type: 'string', default: 'XAF' },
            isActive: { type: 'boolean' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['deposit', 'withdrawal', 'transfer'] },
            amount: { type: 'number', format: 'float' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            fromAccountId: { type: 'string', format: 'uuid' },
            toAccountId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);

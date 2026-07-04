const router = require('express').Router();
const { body, query } = require('express-validator');
const controller = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Deposits, withdrawals, transfers, and history
 */

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get a transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Transaction details }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, controller.getTransaction);

/**
 * @swagger
 * /transactions/accounts/{accountId}/deposit:
 *   post:
 *     tags: [Transactions]
 *     summary: Deposit money into an account
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:      { type: number, example: 10000 }
 *               description: { type: string, example: "Salary" }
 *     responses:
 *       201: { description: Deposit successful }
 *       400: { description: Invalid amount }
 */
router.post('/accounts/:accountId/deposit',
  authenticate,
  [body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive')],
  validate,
  controller.deposit
);

/**
 * @swagger
 * /transactions/accounts/{accountId}/withdraw:
 *   post:
 *     tags: [Transactions]
 *     summary: Withdraw money from an account
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:      { type: number, example: 5000 }
 *               description: { type: string }
 *     responses:
 *       201: { description: Withdrawal successful }
 *       400: { description: Insufficient funds }
 */
router.post('/accounts/:accountId/withdraw',
  authenticate,
  [body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive')],
  validate,
  controller.withdraw
);

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     tags: [Transactions]
 *     summary: Transfer between accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromAccountId, toAccountId, amount]
 *             properties:
 *               fromAccountId: { type: string }
 *               toAccountId:   { type: string }
 *               amount:        { type: number, example: 2500 }
 *               description:   { type: string }
 *     responses:
 *       201: { description: Transfer successful }
 *       400: { description: Insufficient funds or same account }
 */
router.post('/transfer',
  authenticate,
  [
    body('fromAccountId').notEmpty(),
    body('toAccountId').notEmpty(),
    body('amount').isFloat({ gt: 0 }),
  ],
  validate,
  controller.transfer
);

/**
 * @swagger
 * /transactions/accounts/{accountId}/history:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction history for an account
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [deposit, withdrawal, transfer] }
 *     responses:
 *       200: { description: Transaction history with pagination }
 */
router.get('/accounts/:accountId/history',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['deposit', 'withdrawal', 'transfer']),
  ],
  validate,
  controller.getHistory
);

module.exports = router;

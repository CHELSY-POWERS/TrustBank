const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Bank account management
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     tags: [Accounts]
 *     summary: Create a new bank account
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountType: { type: string, enum: [checking, savings], default: checking }
 *               currency:    { type: string, default: XAF }
 *     responses:
 *       201: { description: Account created }
 *   get:
 *     tags: [Accounts]
 *     summary: Get all my accounts
 *     responses:
 *       200: { description: List of accounts }
 */
router.post('/', authenticate,
  [body('accountType').optional().isIn(['checking', 'savings'])],
  validate,
  controller.createAccount
);
router.get('/', authenticate, controller.getMyAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     tags: [Accounts]
 *     summary: Get account by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Account details }
 *       403: { description: Access denied }
 *       404: { description: Account not found }
 *
 * /accounts/{id}/close:
 *   patch:
 *     tags: [Accounts]
 *     summary: Close an account (balance must be 0)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Account closed }
 *       400: { description: Balance not zero }
 */
router.get('/:id', authenticate, controller.getAccount);

/**
 * @swagger
 * /accounts/{id}/balance:
 *   get:
 *     tags: [Accounts]
 *     summary: Get account balance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Balance info }
 */
router.get('/:id/balance', authenticate, controller.getBalance);
router.patch('/:id/close', authenticate, controller.closeAccount);

module.exports = router;

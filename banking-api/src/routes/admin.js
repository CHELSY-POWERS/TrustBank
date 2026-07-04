const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const adminOnly = [authenticate, authorize('admin')];

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     responses:
 *       200:
 *         description: Platform stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:       { type: integer }
 *                 activeUsers:      { type: integer }
 *                 totalAccounts:    { type: integer }
 *                 totalTransactions:{ type: integer }
 *                 totalVolume:      { type: number }
 */
router.get('/stats', ...adminOnly, controller.getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (paginated, searchable)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get('/users', ...adminOnly, controller.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user details with their accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User with accounts }
 *       404: { description: User not found }
 */
router.get('/users/:id', ...adminOnly, controller.getUserById);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Activate or deactivate a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/users/:id/status',
  ...adminOnly,
  [body('isActive').isBoolean()],
  validate,
  controller.updateUserStatus
);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a user's role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [client, admin] }
 *     responses:
 *       200: { description: Role updated }
 */
router.patch('/users/:id/role',
  ...adminOnly,
  [body('role').isIn(['client', 'admin'])],
  validate,
  controller.promoteUser
);

module.exports = router;

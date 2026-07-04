const { body, param } = require('express-validator');

const createAccountValidator = [
  body('accountType').isIn(['checking', 'savings']).withMessage('Account type must be checking or savings.'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter ISO code.')
];

const accountIdParamValidator = [
  param('accountId').isUUID().withMessage('Invalid account identifier.')
];

const updateAccountStatusValidator = [
  param('accountId').isUUID().withMessage('Invalid account identifier.'),
  body('status').isIn(['active', 'frozen', 'closed']).withMessage('Status must be active, frozen, or closed.')
];

module.exports = { createAccountValidator, accountIdParamValidator, updateAccountStatusValidator };

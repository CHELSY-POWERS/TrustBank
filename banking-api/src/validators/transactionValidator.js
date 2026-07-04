const { body, param } = require('express-validator');

const depositValidator = [
  param('accountId').isUUID().withMessage('Invalid account identifier.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description is too long.')
];

const withdrawValidator = [
  param('accountId').isUUID().withMessage('Invalid account identifier.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description is too long.')
];

const transferValidator = [
  body('fromAccountUuid').isUUID().withMessage('Invalid source account identifier.'),
  body('toAccountNumber').trim().notEmpty().withMessage('Destination account number is required.'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description is too long.')
];

module.exports = { depositValidator, withdrawValidator, transferValidator };

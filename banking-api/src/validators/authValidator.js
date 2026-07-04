const { body } = require('express-validator');

const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: 100 }).withMessage('First name is too long.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: 100 }).withMessage('Last name is too long.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('any').withMessage('Invalid phone number.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
    .matches(/\d/).withMessage('New password must contain at least one number.')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter.')
];

module.exports = { registerValidator, loginValidator, changePasswordValidator };

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique account number: ACC + 10 random digits
 */
const generateAccountNumber = () => {
  const digits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `ACC${digits}`;
};

/**
 * Generate a unique transaction reference: TXN + timestamp + 4 random chars
 */
const generateReference = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN${ts}${rand}`;
};

/**
 * Standard API response helpers
 */
const sendSuccess = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const sendError = (res, message = 'Error', status = 400, errors = []) =>
  res.status(status).json({ success: false, message, ...(errors.length && { errors }) });

module.exports = { generateAccountNumber, generateReference, sendSuccess, sendError };

const transactionService = require('../services/transactionService');
const { sendSuccess } = require('../utils/helpers');

const deposit = async (req, res, next) => {
  try {
    const tx = await transactionService.deposit(req.params.accountId, req.body, req.user.id, req.user.role);
    sendSuccess(res, { transaction: tx }, 'Deposit successful', 201);
  } catch (err) { next(err); }
};

const withdraw = async (req, res, next) => {
  try {
    const tx = await transactionService.withdraw(req.params.accountId, req.body, req.user.id, req.user.role);
    sendSuccess(res, { transaction: tx }, 'Withdrawal successful', 201);
  } catch (err) { next(err); }
};

const transfer = async (req, res, next) => {
  try {
    const tx = await transactionService.transfer(req.body, req.user.id, req.user.role);
    sendSuccess(res, { transaction: tx }, 'Transfer successful', 201);
  } catch (err) { next(err); }
};

const getHistory = async (req, res, next) => {
  try {
    const result = await transactionService.getHistory(req.params.accountId, req.user.id, req.user.role, req.query);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getTransaction = async (req, res, next) => {
  try {
    const tx = await transactionService.getTransactionById(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, { transaction: tx });
  } catch (err) { next(err); }
};

module.exports = { deposit, withdraw, transfer, getHistory, getTransaction };

const accountService = require('../services/accountService');
const { sendSuccess } = require('../utils/helpers');

const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.user.id, req.body);
    sendSuccess(res, { account }, 'Account created successfully', 201);
  } catch (err) { next(err); }
};

const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getUserAccounts(req.user.id);
    sendSuccess(res, { accounts });
  } catch (err) { next(err); }
};

const getAccount = async (req, res, next) => {
  try {
    const account = await accountService.getAccountById(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, { account });
  } catch (err) { next(err); }
};

const getBalance = async (req, res, next) => {
  try {
    const balance = await accountService.getBalance(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, balance);
  } catch (err) { next(err); }
};

const closeAccount = async (req, res, next) => {
  try {
    await accountService.closeAccount(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, null, 'Account closed successfully');
  } catch (err) { next(err); }
};

module.exports = { createAccount, getMyAccounts, getAccount, getBalance, closeAccount };

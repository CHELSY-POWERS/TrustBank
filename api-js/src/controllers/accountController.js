const accountService = require('../services/accountService');

const createAccount = async (req, res, next) => {
  try {
    const { accountType } = req.body;
    const account = await accountService.createAccount(req.user.id, accountType || 'checking');
    res.status(201).json({ account });
  } catch (error) { next(error); }
};

const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getUserAccounts(req.user.id);
    res.json({ accounts });
  } catch (error) { next(error); }
};

const getAccount = async (req, res, next) => {
  try {
    const account = await accountService.getAccountDetails(req.params.id, req.user.id);
    res.json({ account });
  } catch (error) { next(error); }
};

const getBalance = async (req, res, next) => {
  try {
    const result = await accountService.getBalance(req.params.id, req.user.id);
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = {
  createAccount, getMyAccounts, getAccount, getBalance
};

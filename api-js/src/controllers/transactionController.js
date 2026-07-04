const transactionService = require('../services/transactionService');

const credit = async (req, res, next) => {
  try {
    const { accountId, amount } = req.body;
    const transaction = await transactionService.credit(accountId, amount, req.user.id);
    res.status(201).json({ transaction });
  } catch (error) { next(error); }
};

const debit = async (req, res, next) => {
  try {
    const { accountId, amount } = req.body;
    const transaction = await transactionService.debit(accountId, amount, req.user.id);
    res.status(201).json({ transaction });
  } catch (error) { next(error); }
};

const transfer = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount } = req.body;
    const transaction = await transactionService.transfer(fromAccountId, toAccountId, amount, req.user.id);
    res.status(201).json({ transaction });
  } catch (error) { next(error); }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await transactionService.getHistory(req.user.id);
    res.json({ history });
  } catch (error) { next(error); }
};

module.exports = {
  credit, debit, transfer, getHistory
};

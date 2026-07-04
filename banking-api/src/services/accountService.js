const { Account, User } = require('../models');
const { generateAccountNumber } = require('../utils/helpers');

const createAccount = async (userId, { accountType = 'checking', currency = 'XAF' }) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const accountNumber = generateAccountNumber();
  const account = await Account.create({ userId, accountType, currency, accountNumber });
  return account;
};

const getUserAccounts = async (userId) => {
  return Account.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
};

const getAccountById = async (accountId, userId, role) => {
  const account = await Account.findByPk(accountId, {
    include: [{ model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] }],
  });
  if (!account) throw { status: 404, message: 'Account not found' };
  if (role !== 'admin' && account.userId !== userId)
    throw { status: 403, message: 'Access denied to this account' };
  return account;
};

const getBalance = async (accountId, userId, role) => {
  const account = await getAccountById(accountId, userId, role);
  return { accountNumber: account.accountNumber, balance: account.balance, currency: account.currency };
};

const closeAccount = async (accountId, userId, role) => {
  const account = await getAccountById(accountId, userId, role);
  if (parseFloat(account.balance) > 0)
    throw { status: 400, message: 'Cannot close account with remaining balance' };
  account.isActive = false;
  await account.save();
};

module.exports = { createAccount, getUserAccounts, getAccountById, getBalance, closeAccount };

const sequelize = require('../config/database');
const { Transaction, Account } = require('../models');
const { generateReference } = require('../utils/helpers');

const deposit = async (accountId, { amount, description }, userId, role) => {
  const t = await sequelize.transaction();
  try {
    const account = await Account.findByPk(accountId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account || !account.isActive) throw { status: 404, message: 'Account not found or inactive' };
    if (role !== 'admin' && account.userId !== userId)
      throw { status: 403, message: 'Access denied' };

    account.balance = parseFloat(account.balance) + parseFloat(amount);
    await account.save({ transaction: t });

    const tx = await Transaction.create({
      type: 'deposit',
      amount,
      description: description || 'Deposit',
      status: 'completed',
      toAccountId: accountId,
      reference: generateReference(),
      balanceAfter: account.balance,
    }, { transaction: t });

    await t.commit();
    return tx;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const withdraw = async (accountId, { amount, description }, userId, role) => {
  const t = await sequelize.transaction();
  try {
    const account = await Account.findByPk(accountId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!account || !account.isActive) throw { status: 404, message: 'Account not found or inactive' };
    if (role !== 'admin' && account.userId !== userId)
      throw { status: 403, message: 'Access denied' };
    if (parseFloat(account.balance) < parseFloat(amount))
      throw { status: 400, message: 'Insufficient funds' };

    account.balance = parseFloat(account.balance) - parseFloat(amount);
    await account.save({ transaction: t });

    const tx = await Transaction.create({
      type: 'withdrawal',
      amount,
      description: description || 'Withdrawal',
      status: 'completed',
      fromAccountId: accountId,
      reference: generateReference(),
      balanceAfter: account.balance,
    }, { transaction: t });

    await t.commit();
    return tx;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const transfer = async ({ fromAccountId, toAccountId, amount, description }, userId, role) => {
  if (fromAccountId === toAccountId)
    throw { status: 400, message: 'Cannot transfer to the same account' };

  const t = await sequelize.transaction();
  try {
    const fromAccount = await Account.findByPk(fromAccountId, { transaction: t, lock: t.LOCK.UPDATE });
    const toAccount = await Account.findByPk(toAccountId, { transaction: t, lock: t.LOCK.UPDATE });

    if (!fromAccount || !fromAccount.isActive) throw { status: 404, message: 'Source account not found' };
    if (!toAccount || !toAccount.isActive) throw { status: 404, message: 'Destination account not found' };
    if (role !== 'admin' && fromAccount.userId !== userId)
      throw { status: 403, message: 'Access denied to source account' };
    if (parseFloat(fromAccount.balance) < parseFloat(amount))
      throw { status: 400, message: 'Insufficient funds' };

    fromAccount.balance = parseFloat(fromAccount.balance) - parseFloat(amount);
    toAccount.balance = parseFloat(toAccount.balance) + parseFloat(amount);
    await fromAccount.save({ transaction: t });
    await toAccount.save({ transaction: t });

    const ref = generateReference();
    const tx = await Transaction.create({
      type: 'transfer',
      amount,
      description: description || 'Transfer',
      status: 'completed',
      fromAccountId,
      toAccountId,
      reference: ref,
      balanceAfter: fromAccount.balance,
    }, { transaction: t });

    await t.commit();
    return tx;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getHistory = async (accountId, userId, role, { page = 1, limit = 10, type } = {}) => {
  const account = await Account.findByPk(accountId);
  if (!account) throw { status: 404, message: 'Account not found' };
  if (role !== 'admin' && account.userId !== userId)
    throw { status: 403, message: 'Access denied' };

  const where = {
    [require('sequelize').Op.or]: [{ fromAccountId: accountId }, { toAccountId: accountId }],
  };
  if (type) where.type = type;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Transaction.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    transactions: rows,
    pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
  };
};

const getTransactionById = async (txId, userId, role) => {
  const tx = await Transaction.findByPk(txId, {
    include: [
      { model: Account, as: 'fromAccount', attributes: ['id', 'accountNumber'] },
      { model: Account, as: 'toAccount', attributes: ['id', 'accountNumber'] },
    ],
  });
  if (!tx) throw { status: 404, message: 'Transaction not found' };

  if (role !== 'admin') {
    const userAccounts = await Account.findAll({ where: { userId }, attributes: ['id'] });
    const ids = userAccounts.map((a) => a.id);
    if (!ids.includes(tx.fromAccountId) && !ids.includes(tx.toAccountId))
      throw { status: 403, message: 'Access denied' };
  }
  return tx;
};

module.exports = { deposit, withdraw, transfer, getHistory, getTransactionById };

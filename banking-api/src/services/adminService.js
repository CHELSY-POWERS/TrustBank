const { User, Account, Transaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getAllUsers = async ({ page = 1, limit = 10, search } = {}) => {
  const where = {};
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']],
  });
  return { users: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) } };
};

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: 'accounts' }],
  });
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};

const updateUserStatus = async (userId, isActive, requesterId) => {
  if (userId === requesterId) throw { status: 400, message: 'Cannot deactivate your own account' };
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  user.isActive = isActive;
  await user.save();
  return user;
};

const promoteUser = async (userId, role, requesterId) => {
  if (userId === requesterId) throw { status: 400, message: 'Cannot change your own role' };
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  user.role = role;
  await user.save();
  return user;
};

const getDashboardStats = async () => {
  const [totalUsers, totalAccounts, totalTransactions, activeUsers] = await Promise.all([
    User.count(),
    Account.count(),
    Transaction.count(),
    User.count({ where: { isActive: true } }),
  ]);

  const volumeResult = await Transaction.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalVolume']],
    where: { status: 'completed' },
    raw: true,
  });

  return {
    totalUsers,
    activeUsers,
    totalAccounts,
    totalTransactions,
    totalVolume: parseFloat(volumeResult.totalVolume) || 0,
  };
};

module.exports = { getAllUsers, getUserById, updateUserStatus, promoteUser, getDashboardStats };

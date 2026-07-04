const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

const register = async ({ firstName, lastName, email, password, phone }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw { status: 409, message: 'Email already registered' };

  const user = await User.create({ firstName, lastName, email, password, phone });
  const token = generateToken(user);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  if (!user.isActive) throw { status: 403, message: 'Account deactivated' };

  const valid = await user.comparePassword(password);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const token = generateToken(user);
  return { user, token };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};

const updateProfile = async (userId, updates) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const allowed = ['firstName', 'lastName', 'phone'];
  allowed.forEach((field) => { if (updates[field] !== undefined) user[field] = updates[field]; });
  await user.save();
  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw { status: 400, message: 'Current password is incorrect' };
  user.password = newPassword;
  await user.save();
};

module.exports = { register, login, getProfile, updateProfile, changePassword };

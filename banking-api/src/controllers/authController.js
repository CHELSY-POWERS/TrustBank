const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/helpers');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    sendSuccess(res, { user, token }, 'Registration successful', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    sendSuccess(res, { user, token }, 'Login successful');
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    sendSuccess(res, { user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, { user }, 'Profile updated');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };

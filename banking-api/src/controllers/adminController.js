const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/helpers');

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, { stats });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    sendSuccess(res, { user });
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body.isActive, req.user.id);
    sendSuccess(res, { user }, `User ${req.body.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
};

const promoteUser = async (req, res, next) => {
  try {
    const user = await adminService.promoteUser(req.params.id, req.body.role, req.user.id);
    sendSuccess(res, { user }, `User role updated to ${req.body.role}`);
  } catch (err) { next(err); }
};

module.exports = { getStats, getAllUsers, getUserById, updateUserStatus, promoteUser };

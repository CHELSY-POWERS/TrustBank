const authService = require('../services/authService');
const { UnauthorizedError } = require('../errors/CustomErrors');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.register(email, password);
    res.status(201).json({ message: 'User registered successfully', data });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ message: 'Login successful', data });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    if (!req.user) throw new UnauthorizedError();
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};

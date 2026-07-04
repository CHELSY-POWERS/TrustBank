const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  fromAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  toAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reference: {
    type: DataTypes.STRING(50),
    unique: true,
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

module.exports = Transaction;

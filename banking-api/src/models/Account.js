const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  accountNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  accountType: {
    type: DataTypes.ENUM('checking', 'savings'),
    defaultValue: 'checking',
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    validate: { min: 0 },
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'XAF',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'accounts',
  timestamps: true,
});

module.exports = Account;

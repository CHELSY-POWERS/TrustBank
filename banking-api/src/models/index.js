const sequelize = require('../config/database');
const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');

// Associations
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Account.hasMany(Transaction, { foreignKey: 'fromAccountId', as: 'sentTransactions' });
Account.hasMany(Transaction, { foreignKey: 'toAccountId', as: 'receivedTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'fromAccountId', as: 'fromAccount' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'toAccount' });

module.exports = { sequelize, User, Account, Transaction };

const accountRepo = require('../repositories/accountRepo');
const { UnauthorizedError, ValidationError } = require('../errors/CustomErrors');

class AccountService {
  async createAccount(userId, accountType) {
    if (!['checking', 'savings'].includes(accountType)) {
      throw new ValidationError('Invalid account type');
    }
    return await accountRepo.createAccount(userId, accountType);
  }

  async getUserAccounts(userId) {
    return await accountRepo.getAccountsByUserId(userId);
  }

  async getAccountDetails(accountId, userId) {
    const account = await accountRepo.getAccountById(accountId);
    if (account.user_id !== userId) {
      throw new UnauthorizedError('Access denied to this account');
    }
    return account;
  }

  async getBalance(accountId, userId) {
    const account = await this.getAccountDetails(accountId, userId);
    return { balance: account.balance };
  }
}

module.exports = new AccountService();

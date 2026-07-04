const accountRepo = require('../repositories/accountRepo');
const transactionRepo = require('../repositories/transactionRepo');
const { InsufficientFundsError, ValidationError, UnauthorizedError } = require('../errors/CustomErrors');

class TransactionService {
  async credit(accountId, amount, userId) {
    if (amount <= 0) throw new ValidationError('Amount must be greater than 0');
    
    const account = await accountRepo.getAccountById(accountId);
    if (account.user_id !== userId) throw new UnauthorizedError();

    const newBalance = parseFloat(account.balance) + parseFloat(amount);
    await accountRepo.updateBalance(accountId, newBalance);

    return await transactionRepo.createTransaction({
      userId,
      fromAccountId: null,
      toAccountId: accountId,
      amount,
      type: 'deposit'
    });
  }

  async debit(accountId, amount, userId) {
    if (amount <= 0) throw new ValidationError('Amount must be greater than 0');
    
    const account = await accountRepo.getAccountById(accountId);
    if (account.user_id !== userId) throw new UnauthorizedError();
    if (parseFloat(account.balance) < parseFloat(amount)) {
      throw new InsufficientFundsError();
    }

    const newBalance = parseFloat(account.balance) - parseFloat(amount);
    await accountRepo.updateBalance(accountId, newBalance);

    return await transactionRepo.createTransaction({
      userId,
      fromAccountId: accountId,
      toAccountId: null,
      amount,
      type: 'withdrawal'
    });
  }

  async transfer(fromAccountId, toAccountId, amount, userId) {
    if (amount <= 0) throw new ValidationError('Amount must be greater than 0');
    if (fromAccountId === toAccountId) throw new ValidationError('Cannot transfer to the same account');

    const fromAccount = await accountRepo.getAccountById(fromAccountId);
    const toAccount = await accountRepo.getAccountById(toAccountId);

    if (fromAccount.user_id !== userId) throw new UnauthorizedError('Access denied to source account');
    if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
      throw new InsufficientFundsError();
    }

    const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount);
    const newToBalance = parseFloat(toAccount.balance) + parseFloat(amount);

    // Update balances
    await accountRepo.updateBalance(fromAccountId, newFromBalance);
    await accountRepo.updateBalance(toAccountId, newToBalance);

    return await transactionRepo.createTransaction({
      userId,
      fromAccountId,
      toAccountId,
      amount,
      type: 'transfer'
    });
  }

  async getHistory(userId) {
    return await transactionRepo.getTransactionsByUser(userId);
  }
}

module.exports = new TransactionService();

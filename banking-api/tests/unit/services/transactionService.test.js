vi.mock('../../../src/models', () => ({
  Transaction: { create: vi.fn() },
  Account: { findByPk: vi.fn() },
}));
vi.mock('../../../src/config/database', () => ({
  transaction: vi.fn(),
}));
vi.mock('../../../src/utils/helpers', () => ({
  generateReference: vi.fn(() => 'TXNTEST0001'),
}));

const sequelizeMock = require('../../../src/config/database');
const { Transaction, Account } = require('../../../src/models');
const transactionService = require('../../../src/services/transactionService');

// Fake DB transaction handle (Sequelize's `t`), see AAA + isolation pattern
const fakeTx = { commit: vi.fn(), rollback: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  sequelizeMock.transaction.mockResolvedValue(fakeTx);
});

describe('transactionService.deposit', () => {
  it('should throw 404 when the account is missing or inactive', async () => {
    Account.findByPk.mockResolvedValue(null);

    await expect(
      transactionService.deposit('acc-1', { amount: 100 }, 'user-1', 'client')
    ).rejects.toMatchObject({ status: 404 });
  });

  it('should throw 403 when a non-owner deposits into someone else\'s account', async () => {
    Account.findByPk.mockResolvedValue({ id: 'acc-1', userId: 'owner', isActive: true });

    await expect(
      transactionService.deposit('acc-1', { amount: 100 }, 'stranger', 'client')
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should increase the balance, create a transaction, and commit', async () => {
    const account = {
      id: 'acc-1',
      userId: 'user-1',
      isActive: true,
      balance: '100.00',
      save: vi.fn().mockResolvedValue(true),
    };
    Account.findByPk.mockResolvedValue(account);
    Transaction.create.mockResolvedValue({ id: 'tx-1', type: 'deposit', amount: 50 });

    const result = await transactionService.deposit(
      'acc-1',
      { amount: 50, description: 'Salary' },
      'user-1',
      'client'
    );

    expect(account.balance).toBe(150); // 100 + 50, coerced to number
    expect(account.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'deposit', amount: 50, toAccountId: 'acc-1' }),
      { transaction: fakeTx }
    );
    expect(fakeTx.commit).toHaveBeenCalled();
    expect(result).toEqual({ id: 'tx-1', type: 'deposit', amount: 50 });
  });

  it('should roll back the transaction if Transaction.create fails', async () => {
    const account = { id: 'acc-1', userId: 'user-1', isActive: true, balance: '100.00', save: vi.fn() };
    Account.findByPk.mockResolvedValue(account);
    Transaction.create.mockRejectedValue(new Error('DB write failed'));

    await expect(
      transactionService.deposit('acc-1', { amount: 50 }, 'user-1', 'client')
    ).rejects.toThrow('DB write failed');

    expect(fakeTx.rollback).toHaveBeenCalled();
    expect(fakeTx.commit).not.toHaveBeenCalled();
  });
});

describe('transactionService.withdraw', () => {
  it('should throw 400 "Insufficient funds" when balance < amount', async () => {
    Account.findByPk.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-1',
      isActive: true,
      balance: '20.00',
    });

    await expect(
      transactionService.withdraw('acc-1', { amount: 50 }, 'user-1', 'client')
    ).rejects.toMatchObject({ status: 400, message: 'Insufficient funds' });
  });

  it('should decrease the balance on a valid withdrawal', async () => {
    const account = {
      id: 'acc-1',
      userId: 'user-1',
      isActive: true,
      balance: '100.00',
      save: vi.fn().mockResolvedValue(true),
    };
    Account.findByPk.mockResolvedValue(account);
    Transaction.create.mockResolvedValue({ id: 'tx-2', type: 'withdrawal', amount: 30 });

    await transactionService.withdraw('acc-1', { amount: 30 }, 'user-1', 'client');

    expect(account.balance).toBe(70);
    expect(fakeTx.commit).toHaveBeenCalled();
  });
});

describe('transactionService.transfer', () => {
  it('should throw 400 when transferring to the same account', async () => {
    await expect(
      transactionService.transfer(
        { fromAccountId: 'acc-1', toAccountId: 'acc-1', amount: 10 },
        'user-1',
        'client'
      )
    ).rejects.toMatchObject({ status: 400, message: 'Cannot transfer to the same account' });

    expect(Account.findByPk).not.toHaveBeenCalled();
  });

  it('should move funds from the source to the destination account', async () => {
    const fromAccount = {
      id: 'acc-1', userId: 'user-1', isActive: true, balance: '100.00', save: vi.fn(),
    };
    const toAccount = {
      id: 'acc-2', userId: 'user-2', isActive: true, balance: '10.00', save: vi.fn(),
    };
    Account.findByPk.mockImplementation((id) =>
      id === 'acc-1' ? Promise.resolve(fromAccount) : Promise.resolve(toAccount)
    );
    Transaction.create.mockResolvedValue({ id: 'tx-3', type: 'transfer' });

    await transactionService.transfer(
      { fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 40 },
      'user-1',
      'client'
    );

    expect(fromAccount.balance).toBe(60);
    expect(toAccount.balance).toBe(50);
    expect(fakeTx.commit).toHaveBeenCalled();
  });
});

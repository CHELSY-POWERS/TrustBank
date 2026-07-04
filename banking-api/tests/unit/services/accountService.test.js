// We replace '../../../src/models' with a fake (a "test double", see PDF
// slides 21-24: "Tests Double") so accountService is tested in isolation,
// with no real database involved — fast, deterministic unit tests.
vi.mock('../../../src/models', () => ({
  User: { findByPk: vi.fn() },
  Account: {
    create: vi.fn(),
    findAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));
vi.mock('../../../src/utils/helpers', () => ({
  generateAccountNumber: vi.fn(() => 'ACC1234567890'),
}));

const { User, Account } = require('../../../src/models');
const accountService = require('../../../src/services/accountService');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('accountService.createAccount', () => {
  it('should throw 404 if the user does not exist', async () => {
    // Arrange
    User.findByPk.mockResolvedValue(null);

    // Act + Assert
    await expect(
      accountService.createAccount('missing-user-id', { accountType: 'checking' })
    ).rejects.toMatchObject({ status: 404, message: 'User not found' });

    expect(Account.create).not.toHaveBeenCalled();
  });

  it('should create the account with a generated account number when the user exists', async () => {
    // Arrange
    User.findByPk.mockResolvedValue({ id: 'user-1' });
    const created = { id: 'acc-1', accountNumber: 'ACC1234567890' };
    Account.create.mockResolvedValue(created);

    // Act
    const result = await accountService.createAccount('user-1', {
      accountType: 'savings',
      currency: 'USD',
    });

    // Assert
    expect(Account.create).toHaveBeenCalledWith({
      userId: 'user-1',
      accountType: 'savings',
      currency: 'USD',
      accountNumber: 'ACC1234567890',
    });
    expect(result).toBe(created);
  });

  it('should default accountType to "checking" and currency to "XAF"', async () => {
    User.findByPk.mockResolvedValue({ id: 'user-1' });
    Account.create.mockResolvedValue({ id: 'acc-2' });

    await accountService.createAccount('user-1', {});

    expect(Account.create).toHaveBeenCalledWith(
      expect.objectContaining({ accountType: 'checking', currency: 'XAF' })
    );
  });
});

describe('accountService.getAccountById', () => {
  it('should throw 404 when the account does not exist', async () => {
    Account.findByPk.mockResolvedValue(null);

    await expect(
      accountService.getAccountById('acc-x', 'user-1', 'client')
    ).rejects.toMatchObject({ status: 404 });
  });

  it('should throw 403 when a non-owner, non-admin user requests the account', async () => {
    Account.findByPk.mockResolvedValue({ id: 'acc-1', userId: 'owner-id' });

    await expect(
      accountService.getAccountById('acc-1', 'someone-else', 'client')
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should allow an admin to access any account', async () => {
    const account = { id: 'acc-1', userId: 'owner-id' };
    Account.findByPk.mockResolvedValue(account);

    const result = await accountService.getAccountById('acc-1', 'admin-id', 'admin');

    expect(result).toBe(account);
  });

  it('should allow the owner to access their own account', async () => {
    const account = { id: 'acc-1', userId: 'owner-id' };
    Account.findByPk.mockResolvedValue(account);

    const result = await accountService.getAccountById('acc-1', 'owner-id', 'client');

    expect(result).toBe(account);
  });
});

describe('accountService.closeAccount', () => {
  it('should throw 400 when the account balance is greater than 0', async () => {
    Account.findByPk.mockResolvedValue({ id: 'acc-1', userId: 'user-1', balance: '150.00' });

    await expect(
      accountService.closeAccount('acc-1', 'user-1', 'client')
    ).rejects.toMatchObject({ status: 400, message: 'Cannot close account with remaining balance' });
  });

  it('should set isActive to false and save when balance is 0', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const account = { id: 'acc-1', userId: 'user-1', balance: '0.00', isActive: true, save };
    Account.findByPk.mockResolvedValue(account);

    await accountService.closeAccount('acc-1', 'user-1', 'client');

    expect(account.isActive).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

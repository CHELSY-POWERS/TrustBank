import { describe, it, expect, vi, beforeEach } from 'vitest';
import accountService from '../../src/services/accountService';
import accountRepo from '../../src/repositories/accountRepo';
import { ValidationError, UnauthorizedError } from '../../src/errors/CustomErrors';

vi.mock('../../src/repositories/accountRepo');

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an account', async () => {
    accountRepo.createAccount.mockResolvedValue({ id: 'acc-1', account_type: 'checking' });
    const result = await accountService.createAccount('user-1', 'checking');
    expect(result.id).toBe('acc-1');
  });

  it('should throw ValidationError for invalid type', async () => {
    await expect(accountService.createAccount('user-1', 'invalid'))
      .rejects.toThrow(ValidationError);
  });

  it('should get account details if authorized', async () => {
    accountRepo.getAccountById.mockResolvedValue({ id: 'acc-1', user_id: 'user-1' });
    const acc = await accountService.getAccountDetails('acc-1', 'user-1');
    expect(acc.id).toBe('acc-1');
  });

  it('should throw UnauthorizedError if user mismatch', async () => {
    accountRepo.getAccountById.mockResolvedValue({ id: 'acc-1', user_id: 'user-1' });
    await expect(accountService.getAccountDetails('acc-1', 'user-2'))
      .rejects.toThrow(UnauthorizedError);
  });
});

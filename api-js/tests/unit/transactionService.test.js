import { describe, it, expect, vi, beforeEach } from 'vitest';
import transactionService from '../../src/services/transactionService';
import accountRepo from '../../src/repositories/accountRepo';
import transactionRepo from '../../src/repositories/transactionRepo';
import { InsufficientFundsError, UnauthorizedError, ValidationError } from '../../src/errors/CustomErrors';

vi.mock('../../src/repositories/accountRepo');
vi.mock('../../src/repositories/transactionRepo');

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('credit should add funds', async () => {
    accountRepo.getAccountById.mockResolvedValue({ id: 'acc-1', user_id: 'user-1', balance: 100 });
    transactionRepo.createTransaction.mockResolvedValue({ id: 'tx-1' });
    
    await transactionService.credit('acc-1', 50, 'user-1');
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 150);
  });

  it('debit should remove funds', async () => {
    accountRepo.getAccountById.mockResolvedValue({ id: 'acc-1', user_id: 'user-1', balance: 100 });
    transactionRepo.createTransaction.mockResolvedValue({ id: 'tx-1' });
    
    await transactionService.debit('acc-1', 50, 'user-1');
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 50);
  });

  it('debit should throw InsufficientFundsError if balance too low', async () => {
    accountRepo.getAccountById.mockResolvedValue({ id: 'acc-1', user_id: 'user-1', balance: 10 });
    await expect(transactionService.debit('acc-1', 50, 'user-1'))
      .rejects.toThrow(InsufficientFundsError);
  });

  it('transfer should move funds', async () => {
    accountRepo.getAccountById
      .mockResolvedValueOnce({ id: 'acc-1', user_id: 'user-1', balance: 100 })
      .mockResolvedValueOnce({ id: 'acc-2', user_id: 'user-2', balance: 0 });
    transactionRepo.createTransaction.mockResolvedValue({ id: 'tx-1' });

    await transactionService.transfer('acc-1', 'acc-2', 40, 'user-1');
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 60);
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-2', 40);
  });
});

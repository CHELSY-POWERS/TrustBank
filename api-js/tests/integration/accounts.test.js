import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import accountService from '../../src/services/accountService';
import supabase from '../../src/utils/supabaseClient';

vi.mock('../../src/services/accountService');
vi.mock('../../src/utils/supabaseClient', () => ({
  default: {
    auth: {
      getUser: vi.fn(),
    }
  }
}));

describe('Accounts Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  });

  it('POST /api/accounts should create account', async () => {
    accountService.createAccount.mockResolvedValue({ id: 'acc-1', account_type: 'checking' });
    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', 'Bearer valid-token')
      .send({ accountType: 'checking' });
    
    expect(res.status).toBe(201);
    expect(res.body.account.id).toBe('acc-1');
  });

  it('GET /api/accounts should return list of accounts', async () => {
    accountService.getUserAccounts.mockResolvedValue([{ id: 'acc-1' }, { id: 'acc-2' }]);
    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(200);
    expect(res.body.accounts).toHaveLength(2);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import authService from '../../src/services/authService';
import supabase from '../../src/utils/supabaseClient';

vi.mock('../../src/services/authService');
vi.mock('../../src/utils/supabaseClient', () => ({
  default: {
    auth: {
      getUser: vi.fn(),
    }
  }
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/register should return 201', async () => {
    authService.register.mockResolvedValue({ user: { id: 'user-1' } });
    const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com', password: 'password' });
    expect(res.status).toBe(201);
  });

  it('POST /api/auth/login should return 200', async () => {
    authService.login.mockResolvedValue({ user: { id: 'user-1' }, session: { access_token: 'token' } });
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password' });
    expect(res.status).toBe(200);
  });

  it('GET /api/auth/me should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me should return 200 with valid token', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('user-1');
  });
});

const request = require('supertest');
const app = require('../../src/app');

const BASE = '/api/v1/auth';

const validUser = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  password: 'Secret123',
  phone: '+237600000000',
};

// Given / When / Then style names (see PDF slides 42-45) applied as
// integration tests: real routes, real controllers, real services, and a
// real (in-memory) database — only the MySQL server itself is swapped out.

describe('POST /auth/register', () => {
  it('given valid data, when registering, then it returns 201 with a user and a token', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined(); // toJSON() must strip it
    expect(typeof res.body.data.token).toBe('string');
  });

  it('given a duplicate email, when registering again, then it returns 409', async () => {
    await request(app).post(`${BASE}/register`).send(validUser);

    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('given a missing email, when registering, then it returns 422 with a validation error', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...validUser, email: undefined });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.includes('email'))).toBe(true);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
  });

  it('given correct credentials, when logging in, then it returns 200 with a token', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
  });

  it('given a wrong password, when logging in, then it returns 401', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });
});

describe('GET /auth/profile (authenticated route)', () => {
  it('given no token, when requesting the profile, then it returns 401', async () => {
    const res = await request(app).get(`${BASE}/profile`);
    expect(res.status).toBe(401);
  });

  it('given a valid token, when requesting the profile, then it returns the current user', async () => {
    const registerRes = await request(app).post(`${BASE}/register`).send(validUser);
    const token = registerRes.body.data.token;

    const res = await request(app)
      .get(`${BASE}/profile`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});

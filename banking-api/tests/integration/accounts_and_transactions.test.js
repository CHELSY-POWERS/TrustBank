const request = require('supertest');
const app = require('../../src/app');

const AUTH = '/api/v1/auth';
const ACCOUNTS = '/api/v1/accounts';
const TX = '/api/v1/transactions';

// Small helper: registers a fresh user and returns { token, userId }
async function registerUser(email) {
  const res = await request(app).post(`${AUTH}/register`).send({
    firstName: 'Test',
    lastName: 'User',
    email,
    password: 'Secret123',
  });
  return { token: res.body.data.token, userId: res.body.data.user.id };
}

describe('Accounts', () => {
  it('given an authenticated user, when creating an account, then it is returned with a 0 balance', async () => {
    const { token } = await registerUser('owner@example.com');

    const res = await request(app)
      .post(ACCOUNTS)
      .set('Authorization', `Bearer ${token}`)
      .send({ accountType: 'savings', currency: 'XAF' });

    expect(res.status).toBe(201);
    expect(res.body.data.account.accountType).toBe('savings');
    expect(Number(res.body.data.account.balance)).toBe(0);
  });

  it('given another user\'s account, when fetching it, then it returns 403', async () => {
    const owner = await registerUser('owner2@example.com');
    const stranger = await registerUser('stranger@example.com');

    const createRes = await request(app)
      .post(ACCOUNTS)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({});
    const accountId = createRes.body.data.account.id;

    const res = await request(app)
      .get(`${ACCOUNTS}/${accountId}`)
      .set('Authorization', `Bearer ${stranger.token}`);

    expect(res.status).toBe(403);
  });

  it('given an account with a positive balance, when closing it, then it returns 400', async () => {
    const { token } = await registerUser('richclose@example.com');
    const createRes = await request(app).post(ACCOUNTS).set('Authorization', `Bearer ${token}`).send({});
    const accountId = createRes.body.data.account.id;

    await request(app)
      .post(`${TX}/accounts/${accountId}/deposit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 500 });

    const res = await request(app)
      .patch(`${ACCOUNTS}/${accountId}/close`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe('Transactions', () => {
  it('given a valid deposit, when posted, then the account balance increases', async () => {
    const { token } = await registerUser('depositor@example.com');
    const createRes = await request(app).post(ACCOUNTS).set('Authorization', `Bearer ${token}`).send({});
    const accountId = createRes.body.data.account.id;

    const depositRes = await request(app)
      .post(`${TX}/accounts/${accountId}/deposit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000, description: 'Salary' });

    expect(depositRes.status).toBe(201);

    const balanceRes = await request(app)
      .get(`${ACCOUNTS}/${accountId}/balance`)
      .set('Authorization', `Bearer ${token}`);

    expect(Number(balanceRes.body.data.balance)).toBe(1000);
  });

  it('given insufficient funds, when withdrawing, then it returns 400', async () => {
    const { token } = await registerUser('poor@example.com');
    const createRes = await request(app).post(ACCOUNTS).set('Authorization', `Bearer ${token}`).send({});
    const accountId = createRes.body.data.account.id;

    const res = await request(app)
      .post(`${TX}/accounts/${accountId}/withdraw`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient funds/i);
  });

  it('given two accounts, when transferring, then funds move from source to destination', async () => {
    const alice = await registerUser('alice@example.com');
    const bob = await registerUser('bob@example.com');

    const aliceAcc = (
      await request(app).post(ACCOUNTS).set('Authorization', `Bearer ${alice.token}`).send({})
    ).body.data.account;
    const bobAcc = (
      await request(app).post(ACCOUNTS).set('Authorization', `Bearer ${bob.token}`).send({})
    ).body.data.account;

    await request(app)
      .post(`${TX}/accounts/${aliceAcc.id}/deposit`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ amount: 500 });

    const transferRes = await request(app)
      .post(`${TX}/transfer`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ fromAccountId: aliceAcc.id, toAccountId: bobAcc.id, amount: 200 });

    expect(transferRes.status).toBe(201);

    const aliceBalance = await request(app)
      .get(`${ACCOUNTS}/${aliceAcc.id}/balance`)
      .set('Authorization', `Bearer ${alice.token}`);
    const bobBalance = await request(app)
      .get(`${ACCOUNTS}/${bobAcc.id}/balance`)
      .set('Authorization', `Bearer ${bob.token}`);

    expect(Number(aliceBalance.body.data.balance)).toBe(300);
    expect(Number(bobBalance.body.data.balance)).toBe(200);
  });

  it('given a history request, when queried, then it returns paginated results', async () => {
    const { token } = await registerUser('history@example.com');
    const accountId = (
      await request(app).post(ACCOUNTS).set('Authorization', `Bearer ${token}`).send({})
    ).body.data.account.id;

    for (const amount of [100, 200, 300]) {
      await request(app)
        .post(`${TX}/accounts/${accountId}/deposit`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount });
    }

    const res = await request(app)
      .get(`${TX}/accounts/${accountId}/history?page=1&limit=2`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.transactions).toHaveLength(2);
    expect(res.body.data.pagination).toMatchObject({ total: 3, page: 1, limit: 2, pages: 2 });
  });
});

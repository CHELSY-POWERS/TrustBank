vi.mock('../../../src/models', () => ({
  User: { findOne: vi.fn(), create: vi.fn(), findByPk: vi.fn() },
}));

const { User } = require('../../../src/models');
const authService = require('../../../src/services/authService');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.register', () => {
  it('should throw 409 when the email is already registered', async () => {
    User.findOne.mockResolvedValue({ id: 'existing-user' });

    await expect(
      authService.register({ email: 'taken@example.com', password: 'Secret123' })
    ).rejects.toMatchObject({ status: 409, message: 'Email already registered' });

    expect(User.create).not.toHaveBeenCalled();
  });

  it('should create the user and return a signed JWT on success', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 'user-1', email: 'new@example.com', role: 'client' });

    const { user, token } = await authService.register({
      firstName: 'Jean', lastName: 'Dupont', email: 'new@example.com', password: 'Secret123',
    });

    expect(user.id).toBe('user-1');
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // header.payload.signature
  });
});

describe('authService.login', () => {
  it('should throw 401 when no user matches the email', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'ghost@example.com', password: 'x' })
    ).rejects.toMatchObject({ status: 401, message: 'Invalid credentials' });
  });

  it('should throw 403 when the account is deactivated', async () => {
    User.findOne.mockResolvedValue({ isActive: false, comparePassword: vi.fn() });

    await expect(
      authService.login({ email: 'a@example.com', password: 'x' })
    ).rejects.toMatchObject({ status: 403, message: 'Account deactivated' });
  });

  it('should throw 401 when the password does not match', async () => {
    User.findOne.mockResolvedValue({
      isActive: true,
      comparePassword: vi.fn().mockResolvedValue(false),
    });

    await expect(
      authService.login({ email: 'a@example.com', password: 'wrong' })
    ).rejects.toMatchObject({ status: 401, message: 'Invalid credentials' });
  });

  it('should return the user and a token on valid credentials', async () => {
    const user = {
      id: 'user-1', email: 'a@example.com', role: 'client', isActive: true,
      comparePassword: vi.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(user);

    const result = await authService.login({ email: 'a@example.com', password: 'right' });

    expect(result.user).toBe(user);
    expect(typeof result.token).toBe('string');
  });
});

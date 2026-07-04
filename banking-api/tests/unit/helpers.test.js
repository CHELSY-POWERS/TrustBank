const {
  generateAccountNumber,
  generateReference,
  sendSuccess,
  sendError,
} = require('../../src/utils/helpers');

describe('helpers: generateAccountNumber', () => {
  it('should return a string starting with ACC followed by 10 digits', () => {
    // Act
    const result = generateAccountNumber();

    // Assert
    expect(result).toMatch(/^ACC\d{10}$/);
  });

  it('should return a different value on each call', () => {
    const a = generateAccountNumber();
    const b = generateAccountNumber();
    expect(a).not.toBe(b);
  });
});

describe('helpers: generateReference', () => {
  it('should return a string starting with TXN', () => {
    const result = generateReference();
    expect(result.startsWith('TXN')).toBe(true);
  });

  it('should return a different value on each call', () => {
    const a = generateReference();
    const b = generateReference();
    expect(a).not.toBe(b);
  });
});

describe('helpers: sendSuccess', () => {
  it('should send a JSON success envelope with the given status', () => {
    // Arrange: a fake Express `res` (a test double — see PDF slide 22-24)
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Act
    sendSuccess(res, { id: 1 }, 'Created', 201);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: 1 },
    });
  });

  it('should default to status 200 and message "Success"', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

    sendSuccess(res, { id: 2 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Success' })
    );
  });
});

describe('helpers: sendError', () => {
  it('should send a JSON error envelope without an "errors" key when none are given', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

    sendError(res, 'Not found', 404);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
  });

  it('should include the "errors" array when validation errors are given', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

    sendError(res, 'Validation failed', 422, ['email is required']);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: ['email is required'],
    });
  });
});

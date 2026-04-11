jest.mock('../src/db/database', () => ({
  prepare: jest.fn(() => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
  })),
}));

jest.mock('../src/services/githubService', () => ({
  checkRepoExists: jest.fn(),
}));

jest.mock('../src/services/emailService', () => ({
  sendConfirmationEmail: jest.fn(),
}));

const db = require('../src/db/database');
const { checkRepoExists } = require('../src/services/githubService');
const { sendConfirmationEmail } = require('../src/services/emailService');
const { subscribe, confirm, unsubscribe, getSubscriptions } = require('../src/services/subscriptionService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('subscribe', () => {
  test('returns 404 if repo not found on GitHub', async () => {
    checkRepoExists.mockResolvedValue(false);

    const result = await subscribe('user@example.com', 'owner', 'repo');

    expect(result.status).toBe(404);
  });

  test('returns 409 if subscription already exists', async () => {
    checkRepoExists.mockResolvedValue(true);

    db.prepare
      .mockReturnValueOnce({ run: jest.fn() })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1 }) })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 99 }) });

    const result = await subscribe('user@example.com', 'owner', 'repo');

    expect(result.status).toBe(409);
  });

  test('returns 200 and sends confirmation email on success', async () => {
    checkRepoExists.mockResolvedValue(true);

    db.prepare
      .mockReturnValueOnce({ run: jest.fn() })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1 }) })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue(null) })
      .mockReturnValueOnce({ run: jest.fn() });

    const result = await subscribe('user@example.com', 'owner', 'repo');

    expect(result.status).toBe(200);
    expect(sendConfirmationEmail).toHaveBeenCalledWith('user@example.com', expect.any(String), expect.any(String));
  });
});

describe('confirm', () => {
  test('returns 404 if token not found', () => {
    db.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(null) });

    const result = confirm('bad-token');

    expect(result.status).toBe(404);
  });

  test('returns 200 if already confirmed', () => {
    db.prepare.mockReturnValue({ get: jest.fn().mockReturnValue({ id: 1, confirmed: 1 }) });

    const result = confirm('some-token');

    expect(result.status).toBe(200);
  });

  test('confirms subscription and returns 200', () => {
    const mockRun = jest.fn();
    db.prepare
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1, confirmed: 0 }) })
      .mockReturnValueOnce({ run: mockRun });

    const result = confirm('some-token');

    expect(result.status).toBe(200);
    expect(mockRun).toHaveBeenCalled();
  });
});

describe('unsubscribe', () => {
  test('returns 404 if token not found', () => {
    db.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(null) });

    const result = unsubscribe('bad-token');

    expect(result.status).toBe(404);
  });

  test('deletes subscription and returns 200', () => {
    const mockRun = jest.fn();
    db.prepare
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1 }) })
      .mockReturnValueOnce({ run: mockRun });

    const result = unsubscribe('some-token');

    expect(result.status).toBe(200);
    expect(mockRun).toHaveBeenCalled();
  });
});

describe('getSubscriptions', () => {
  test('returns all confirmed subscriptions as array when no pagination args', () => {
    db.prepare
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ count: 1 }) })
      .mockReturnValueOnce({
        all: jest.fn().mockReturnValue([
          { owner: 'expressjs', repo: 'express', created_at: '2026-04-09 10:00:00' },
        ]),
      });

    const result = getSubscriptions('user@example.com');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].repo).toBe('expressjs/express');
  });

  test('returns empty array if no subscriptions when no pagination args', () => {
    db.prepare
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ count: 0 }) })
      .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) });

    const result = getSubscriptions('nobody@example.com');

    expect(result).toEqual([]);
  });

  test('returns paginated envelope when page and limit provided', () => {
    db.prepare
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ count: 5 }) })
      .mockReturnValueOnce({
        all: jest.fn().mockReturnValue([
          { owner: 'expressjs', repo: 'express', created_at: '2026-04-09 10:00:00' },
        ]),
      });

    const result = getSubscriptions('user@example.com', 1, 10);

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 5, page: 1, limit: 10 });
  });
});

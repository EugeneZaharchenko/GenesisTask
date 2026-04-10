jest.mock('https');
jest.mock('node-cache');

const https = require('https');
const NodeCache = require('node-cache');

const mockGet = jest.fn();
const mockSet = jest.fn();

NodeCache.mockImplementation(() => ({
  get: mockGet,
  set: mockSet,
}));

const { checkRepoExists, getLatestRelease } = require('../src/services/githubService');

function mockHttpsResponse(statusCode, body = '') {
  const mockRes = {
    statusCode,
    headers: {},
    on: jest.fn((event, cb) => {
      if (event === 'data') cb(body);
      if (event === 'end') cb();
    }),
  };
  const mockReq = {
    on: jest.fn(),
    end: jest.fn(),
  };
  https.request.mockImplementation((opts, cb) => {
    cb(mockRes);
    return mockReq;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('checkRepoExists', () => {
  test('returns cached value without making HTTP request', async () => {
    mockGet.mockReturnValue(true);

    const result = await checkRepoExists('owner', 'repo');

    expect(result).toBe(true);
    expect(https.request).not.toHaveBeenCalled();
  });

  test('returns true and caches result when repo exists', async () => {
    mockGet.mockReturnValue(undefined);
    mockHttpsResponse(200);

    const result = await checkRepoExists('owner', 'repo');

    expect(result).toBe(true);
    expect(mockSet).toHaveBeenCalledWith('exists:owner/repo', true);
  });

  test('returns false and caches result when repo not found', async () => {
    mockGet.mockReturnValue(undefined);
    mockHttpsResponse(404);

    const result = await checkRepoExists('owner', 'repo');

    expect(result).toBe(false);
    expect(mockSet).toHaveBeenCalledWith('exists:owner/repo', false);
  });

  test('throws on unexpected GitHub status code', async () => {
    mockGet.mockReturnValue(undefined);
    mockHttpsResponse(500);

    await expect(checkRepoExists('owner', 'repo')).rejects.toThrow('GitHub API error: 500');
  });
});

describe('getLatestRelease', () => {
  test('returns cached tag without making HTTP request', async () => {
    mockGet.mockReturnValue('v1.2.3');

    const result = await getLatestRelease('owner', 'repo');

    expect(result).toBe('v1.2.3');
    expect(https.request).not.toHaveBeenCalled();
  });

  test('returns tag_name and caches result on success', async () => {
    mockGet.mockReturnValue(undefined);
    mockHttpsResponse(200, JSON.stringify({ tag_name: 'v2.0.0' }));

    const result = await getLatestRelease('owner', 'repo');

    expect(result).toBe('v2.0.0');
    expect(mockSet).toHaveBeenCalledWith('release:owner/repo', 'v2.0.0');
  });

  test('returns null and caches when no releases found', async () => {
    mockGet.mockReturnValue(undefined);
    mockHttpsResponse(404);

    const result = await getLatestRelease('owner', 'repo');

    expect(result).toBeNull();
    expect(mockSet).toHaveBeenCalledWith('release:owner/repo', null);
  });

  test('throws on unexpected GitHub status code', async () => {
    mockGet.mockReturnValue(undefined);
    mockHttpsResponse(503);

    await expect(getLatestRelease('owner', 'repo')).rejects.toThrow('GitHub API error: 503');
  });
});

const https = require('https');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 10 * 60 });

function buildHeaders() {
  const headers = { 'User-Agent': 'genesis-release-notifier' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function githubRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: buildHeaders(),
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 429) {
          const retryAfter = res.headers['retry-after'] || 60;
          reject(new Error(`GitHub rate limit exceeded. Retry after ${retryAfter}s`));
        } else {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function checkRepoExists(owner, repo) {
  const key = `exists:${owner}/${repo}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const { statusCode } = await githubRequest(`/repos/${owner}/${repo}`);
  if (statusCode === 200) {
    cache.set(key, true);
    return true;
  }
  if (statusCode === 404) {
    cache.set(key, false);
    return false;
  }
  throw new Error(`GitHub API error: ${statusCode}`);
}

async function getLatestRelease(owner, repo) {
  const key = `release:${owner}/${repo}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const { statusCode, body } = await githubRequest(`/repos/${owner}/${repo}/releases/latest`);
  if (statusCode === 200) {
    const tag = JSON.parse(body).tag_name;
    cache.set(key, tag);
    return tag;
  }
  if (statusCode === 404) {
    cache.set(key, null);
    return null;
  }
  throw new Error(`GitHub API error: ${statusCode}`);
}

module.exports = { checkRepoExists, getLatestRelease };

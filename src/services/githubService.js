const https = require('https');

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
  const { statusCode } = await githubRequest(`/repos/${owner}/${repo}`);
  if (statusCode === 200) return true;
  if (statusCode === 404) return false;
  throw new Error(`GitHub API error: ${statusCode}`);
}

async function getLatestRelease(owner, repo) {
  const { statusCode, body } = await githubRequest(`/repos/${owner}/${repo}/releases/latest`);
  if (statusCode === 200) return JSON.parse(body).tag_name;
  if (statusCode === 404) return null;
  throw new Error(`GitHub API error: ${statusCode}`);
}

module.exports = { checkRepoExists, getLatestRelease };

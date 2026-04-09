const https = require('https');

function checkRepoExists(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: { 'User-Agent': 'genesis-release-notifier' }
    };

    const req = https.request(options, (res) => {

      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else if (res.statusCode === 404) {
          resolve(false);
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

module.exports = { checkRepoExists };

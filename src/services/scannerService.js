const db = require('../db/database');
const { getLatestRelease } = require('./githubService');
const { sendReleaseNotification } = require('./emailService');

const INTERVAL_MS = parseInt(process.env.SCANNER_INTERVAL_MS) || 5 * 60 * 1000;

async function checkReleases() {
  const repos = db.prepare(`
    SELECT DISTINCT r.id, r.owner, r.repo, r.last_seen_tag
    FROM repositories r
    JOIN subscriptions s ON s.repository_id = r.id
    WHERE s.confirmed = true
  `).all();

  for (const repo of repos) {
    const latestTag = await getLatestRelease(repo.owner, repo.repo);

    if (!latestTag) continue;

    if (latestTag !== repo.last_seen_tag) {
      db.prepare('UPDATE repositories SET last_seen_tag = ? WHERE id = ?')
        .run(latestTag, repo.id);

      if (repo.last_seen_tag !== null) {
        const subscribers = db.prepare(`
          SELECT email FROM subscriptions
          WHERE repository_id = ? AND confirmed = true
        `).all(repo.id);

        for (const sub of subscribers) {
          await sendReleaseNotification(sub.email, `${repo.owner}/${repo.repo}`, latestTag);
        }
      }
    }
  }
}

function startScanner() {
  setInterval(checkReleases, INTERVAL_MS);
}

module.exports = { startScanner };

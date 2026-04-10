const db = require('../db/database');
const { generateToken } = require('../utils/token');
const { checkRepoExists } = require('./githubService');
const { sendConfirmationEmail } = require('./emailService');

async function subscribe(email, owner, repo) {
  const repoExists = await checkRepoExists(owner, repo);
  if (!repoExists) {
    return { status: 404, error: 'Repository not found on GitHub' };
  }

  db.prepare('INSERT OR IGNORE INTO repositories (owner, repo) VALUES (?, ?)').run(owner, repo);

  const repository = db.prepare('SELECT id FROM repositories WHERE owner = ? AND repo = ?').get(owner, repo);

  const existing = db.prepare(
    'SELECT id FROM subscriptions WHERE email = ? AND repository_id = ?'
  ).get(email, repository.id);

  if (existing) {
    return { status: 409, error: 'Subscription already exists' };
  }

  const token = generateToken();
  db.prepare(
    'INSERT INTO subscriptions (email, repository_id, token) VALUES (?, ?, ?)'
  ).run(email, repository.id, token);

  await sendConfirmationEmail(email, token);

  return { status: 200, token };
}

function confirm(token) {
  const subscription = db.prepare('SELECT id, confirmed FROM subscriptions WHERE token = ?').get(token);

  if (!subscription) {
    return { status: 404, error: 'Token not found' };
  }

  if (subscription.confirmed) {
    return { status: 200, message: 'Subscription already confirmed' };
  }

  db.prepare('UPDATE subscriptions SET confirmed = true WHERE token = ?').run(token);

  return { status: 200, message: 'Subscription confirmed successfully' };
}

function unsubscribe(token) {
  const subscription = db.prepare('SELECT id FROM subscriptions WHERE token = ?').get(token);

  if (!subscription) {
    return { status: 404, error: 'Token not found' };
  }

  db.prepare('DELETE FROM subscriptions WHERE token = ?').run(token);

  return { status: 200, message: 'Unsubscribed successfully' };
}

function getSubscriptions(email) {
  const rows = db.prepare(`
    SELECT r.owner, r.repo, s.created_at
    FROM subscriptions s
    JOIN repositories r ON r.id = s.repository_id
    WHERE s.email = ? AND s.confirmed = true
  `).all(email);

  return rows.map((row) => ({
    repo: `${row.owner}/${row.repo}`,
    created_at: row.created_at
  }));
}

module.exports = { subscribe, confirm, unsubscribe, getSubscriptions };

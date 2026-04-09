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

  sendConfirmationEmail(email, token);

  return { status: 200, token };
}

module.exports = { subscribe };

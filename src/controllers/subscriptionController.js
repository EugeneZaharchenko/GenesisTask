const { subscribe, confirm, unsubscribe, getSubscriptions } = require('../services/subscriptionService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

async function handleSubscribe(req, res) {
  const { email, repo } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!repo || !REPO_REGEX.test(repo)) {
    return res.status(400).json({ error: 'Invalid repo format. Expected: owner/repo' });
  }

  const [owner, repoName] = repo.split('/');
  const result = await subscribe(email, owner, repoName);

  return res.status(result.status).json(
    result.error ? { error: result.error } : { message: 'Subscription created. Please confirm your email.' }
  );
}

function handleConfirm(req, res) {
  const { token } = req.params;
  const result = confirm(token);

  return res.status(result.status).json(
    result.error ? { error: result.error } : { message: result.message }
  );
}

function handleUnsubscribe(req, res) {
  const { token } = req.params;
  const result = unsubscribe(token);

  return res.status(result.status).json(
    result.error ? { error: result.error } : { message: result.message }
  );
}

function handleGetSubscriptions(req, res) {
  const { email } = req.query;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = getSubscriptions(email, page, limit);

  return res.status(200).json(result);
}

module.exports = { handleSubscribe, handleConfirm, handleUnsubscribe, handleGetSubscriptions };

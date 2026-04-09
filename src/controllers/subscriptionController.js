const { subscribe } = require('../services/subscriptionService');

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

module.exports = { handleSubscribe };

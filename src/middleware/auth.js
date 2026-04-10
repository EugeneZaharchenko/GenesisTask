function apiKeyAuth(req, res, next) {
  const expected = process.env.API_KEY;

  if (!expected) {
    return res.status(500).json({ error: 'API_KEY not configured on server' });
  }

  const provided = req.header('X-API-Key');

  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

module.exports = { apiKeyAuth };

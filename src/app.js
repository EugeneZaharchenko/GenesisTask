const express = require('express');
const subscriptionRoutes = require('./routes/subscriptions');
const { apiKeyAuth } = require('./middleware/auth');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiKeyAuth, subscriptionRoutes);

module.exports = app;

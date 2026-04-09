const express = require('express');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', subscriptionRoutes);

module.exports = app;

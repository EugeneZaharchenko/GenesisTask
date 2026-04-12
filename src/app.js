const express = require('express');
const subscriptionRoutes = require('./routes/subscriptions');
const { apiKeyAuth } = require('./middleware/auth');
const { register, httpRequestsTotal } = require('./services/metricsService');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api', apiKeyAuth, subscriptionRoutes);

module.exports = app;

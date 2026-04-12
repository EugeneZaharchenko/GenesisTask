const client = require('prom-client');

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const confirmedSubscriptionsGauge = new client.Gauge({
  name: 'confirmed_subscriptions_total',
  help: 'Total number of confirmed subscriptions',
});

const scannerRunsTotal = new client.Counter({
  name: 'scanner_runs_total',
  help: 'Total number of scanner runs',
});

const emailsSentTotal = new client.Counter({
  name: 'emails_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['type'],
});

module.exports = {
  register: client.register,
  httpRequestsTotal,
  confirmedSubscriptionsGauge,
  scannerRunsTotal,
  emailsSentTotal,
};

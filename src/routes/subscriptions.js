const express = require('express');
const { handleSubscribe } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/subscribe', handleSubscribe);

module.exports = router;

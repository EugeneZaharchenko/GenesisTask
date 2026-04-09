const express = require('express');
const { handleSubscribe, handleConfirm, handleUnsubscribe, handleGetSubscriptions } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/subscribe', handleSubscribe);
router.get('/confirm/:token', handleConfirm);
router.get('/unsubscribe/:token', handleUnsubscribe);
router.get('/subscriptions', handleGetSubscriptions);

module.exports = router;

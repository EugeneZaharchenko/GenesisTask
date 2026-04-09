const express = require('express');
const { handleSubscribe, handleConfirm, handleUnsubscribe } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/subscribe', handleSubscribe);
router.get('/confirm/:token', handleConfirm);
router.get('/unsubscribe/:token', handleUnsubscribe);

module.exports = router;

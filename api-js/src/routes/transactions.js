const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/credit', transactionController.credit);
router.post('/debit', transactionController.debit);
router.post('/transfer', transactionController.transfer);
router.get('/history', transactionController.getHistory);

module.exports = router;

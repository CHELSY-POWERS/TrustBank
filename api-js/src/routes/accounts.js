const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', accountController.createAccount);
router.get('/', accountController.getMyAccounts);
router.get('/:id', accountController.getAccount);
router.get('/:id/balance', accountController.getBalance);

module.exports = router;

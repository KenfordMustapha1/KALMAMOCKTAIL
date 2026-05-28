const express = require('express');
const router = express.Router();
const { getCustomers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/customers', protect, admin, getCustomers);

module.exports = router;

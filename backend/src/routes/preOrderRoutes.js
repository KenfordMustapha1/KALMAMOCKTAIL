const express = require('express');
const router = express.Router();
const {
  createPreOrder,
  getPreOrderByToken,
  redeemPreOrder,
  getMyPreOrders,
} = require('../controllers/preOrderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createPreOrder);
router.get('/mine', protect, getMyPreOrders);
router.get('/:token', getPreOrderByToken);
router.post('/:token/redeem', protect, admin, redeemPreOrder);

module.exports = router;

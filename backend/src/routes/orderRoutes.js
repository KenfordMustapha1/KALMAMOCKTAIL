const express = require('express');
const router = express.Router();
const {
  createOrder,
  adminCreateOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.post('/admin', protect, admin, adminCreateOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/payment', protect, admin, updateOrderPayment);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;

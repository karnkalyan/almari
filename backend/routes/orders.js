const express = require('express');
const { getOrders, getOrder, getUserOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getOrders);
router.get('/my', authenticate, getUserOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);

module.exports = router;

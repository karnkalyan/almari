const express = require('express');
const { getFlashSales, getFlashSale, createFlashSale, updateFlashSale, deleteFlashSale } = require('../controllers/flashSaleController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getFlashSales);
router.get('/:id', getFlashSale);
router.post('/', createFlashSale);
router.put('/:id', updateFlashSale);
router.delete('/:id', deleteFlashSale);

module.exports = router;

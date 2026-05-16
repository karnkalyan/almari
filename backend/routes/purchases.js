const express = require('express');
const { getPurchases, createPurchase, updatePurchase, deletePurchase } = require('../controllers/purchaseController');

const router = express.Router();

router.get('/', getPurchases);
router.post('/', createPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

module.exports = router;

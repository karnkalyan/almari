const express = require('express');
const { getPromoCodes, getPromoCode, createPromoCode, updatePromoCode, deletePromoCode, validatePromoCode } = require('../controllers/promoCodeController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPromoCodes);
router.get('/:id', getPromoCode);
router.post('/', createPromoCode);
router.put('/:id', updatePromoCode);
router.delete('/:id', deletePromoCode);
router.post('/validate', validatePromoCode);

module.exports = router;

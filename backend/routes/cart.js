const express = require('express');
const { getCart, upsertCartItem, deleteCartItem } = require('../controllers/cartController');

const router = express.Router();

router.get('/', getCart);
router.post('/', upsertCartItem);
router.delete('/:id', deleteCartItem);

module.exports = router;

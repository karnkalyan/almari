const express = require('express');
const { getWishlist, addWishlistItem, deleteWishlistItem } = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', getWishlist);
router.post('/', addWishlistItem);
router.delete('/:id', deleteWishlistItem);

module.exports = router;

const express = require('express');
const { getOffers, getOffer, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getOffers);
router.get('/:id', getOffer);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;

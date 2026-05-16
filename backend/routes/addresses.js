const express = require('express');
const { getUserAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getUserAddresses);
router.post('/', authenticate, createAddress);
router.put('/:id', authenticate, updateAddress);
router.delete('/:id', authenticate, deleteAddress);

module.exports = router;
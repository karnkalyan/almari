const express = require('express');
const { getFlags, createFlag, updateFlag, deleteFlag, setFlagProducts } = require('../controllers/productFlagController');

const router = express.Router();

router.get('/', getFlags);
router.post('/', createFlag);
router.put('/:id', updateFlag);
router.delete('/:id', deleteFlag);
router.put('/:id/products', setFlagProducts);

module.exports = router;

const express = require('express');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', getReviews);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;

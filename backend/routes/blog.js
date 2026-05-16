const express = require('express');
const { getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost } = require('../controllers/blogController');

const router = express.Router();

router.get('/', getBlogPosts);
router.get('/:id', getBlogPost);
router.post('/', createBlogPost);
router.put('/:id', updateBlogPost);
router.delete('/:id', deleteBlogPost);

module.exports = router;

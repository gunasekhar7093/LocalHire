const express = require('express');
const router = express.Router();
const { getPosts, createPost, getPostById, deletePost, likePost, getLikedPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.get('/liked', protect, getLikedPosts);

router.route('/:id')
  .get(getPostById)
  .delete(protect, deletePost);

router.route('/:id/like')
  .put(protect, likePost);

module.exports = router;

const Post = require('../models/Post');

// @desc    Get all posts (with search & filters)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { keyword, type, state, city, userId } = req.query;
    
    let query = {};
    
    if (keyword) {
      const sanitizedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const words = sanitizedKeyword.split(/\s+/).filter(w => w.length > 2); // Ignore short words like 'in', 'a'
      const searchRegex = words.length > 0 ? words.join('|') : sanitizedKeyword;

      query.$or = [
        { skill: { $regex: searchRegex, $options: 'i' } },
        { role: { $regex: searchRegex, $options: 'i' } },
        { description: { $regex: searchRegex, $options: 'i' } },
        { state: { $regex: searchRegex, $options: 'i' } },
        { city: { $regex: searchRegex, $options: 'i' } },
        { gender: { $regex: searchRegex, $options: 'i' } }
      ];
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (state) {
      query.state = state;
    }
    if (city) {
      query.city = city;
    }
    if (userId) {
      query.userId = userId;
    }

    const posts = await Post.find(query)
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      userId: req.user.id
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'name profileImage');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Handle privacy: hide phone if private
    if (post.phoneVisibility === 'Private') {
      post.phone = undefined;
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Make sure logged in user matches post user
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like / unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes) {
      post.likes = [];
    }

    // Toggle like
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all liked posts by the current user
// @route   GET /api/posts/liked
// @access  Private
exports.getLikedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.user.id })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

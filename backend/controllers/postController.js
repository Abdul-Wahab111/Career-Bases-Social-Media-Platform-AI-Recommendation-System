const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Text is required");
  }

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const post = await Post.create({
    user: req.user.id,
    text: text.trim(),
    image,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("user", "name email")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name",
      },
    });

  res.status(201).json(populatedPost);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("user", "name email _id") // Make sure _id is included
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name _id", // Make sure _id is included
      },
    })
    .sort({ createdAt: -1 });

  console.log("Posts being sent:", posts); // Add this log
  res.json(posts);
});

// @desc    Get posts created by the logged-in user
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.user.id })
    .populate("user", "name email")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name _id",
      },
    })
    .sort({ createdAt: -1 });

  res.json(posts);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Check ownership
  if (post.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this post");
  }

  const { text } = req.body;
  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Text is required");
  }

  post.text = text.trim();

  const updatedPost = await post.save();
  const populatedPost = await Post.findById(updatedPost._id)
    .populate("user", "name email")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name _id",
      },
    });

  res.json(populatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Check ownership
  if (post.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this post");
  }

  await post.deleteOne(); // Using deleteOne() instead of remove()
  res.json({ message: "Post deleted successfully", id: post._id });
});

// @desc    Like or unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = req.user.id;
  const likeIndex = post.likes.indexOf(userId);

  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await post.save();

  const populatedPost = await Post.findById(post._id)
    .populate("user", "name email")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name _id",
      },
    });

  res.json(populatedPost);
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = {
    user: req.user.id,
    text: text.trim(),
    createdAt: new Date(),
  };

  post.comments.push(comment);
  await post.save();

  const populatedPost = await Post.findById(post._id).populate({
    path: "comments",
    populate: {
      path: "user",
      select: "name _id",
    },
  });

  res.status(201).json(populatedPost.comments);
});

// @desc    Delete a comment from a post
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Check ownership of comment
  if (comment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  post.comments.pull({ _id: req.params.commentId });
  await post.save();

  const populatedPost = await Post.findById(post._id).populate({
    path: "comments",
    populate: {
      path: "user",
      select: "name _id",
    },
  });

  res.json({
    message: "Comment deleted successfully",
    comments: populatedPost.comments,
  });
});

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
};

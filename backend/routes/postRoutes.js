const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { checkProfile } = require("../middleware/checkProfileMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getMyPosts,
  getAllPosts,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
} = require("../controllers/postController");

// Add upload.single('image') middleware for the create post route
router.post("/", protect, checkProfile, upload.single("image"), createPost);
router.get("/", protect, checkProfile, getMyPosts);
router.get("/allposts", protect, checkProfile, getAllPosts);

router.put("/:id", protect, checkProfile, updatePost);
router.delete("/:id", protect, checkProfile, deletePost);
router.put("/:id/like", protect, checkProfile, likePost);
router.post("/:id/comments", protect, checkProfile, addComment);
router.delete(
  "/:postId/comments/:commentId",
  protect,
  checkProfile,
  deleteComment
); // Delete comments

module.exports = router;

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
  getPostsByUserId, // ✅ Import
} = require("../controllers/postController");

router.post("/", protect, checkProfile, upload.single("image"), createPost);
router.get("/", protect, checkProfile, getMyPosts);
router.get("/allposts", protect, checkProfile, getAllPosts);
router.get("/user/:userId", protect, checkProfile, getPostsByUserId); // ✅ NEW route

router.put("/:id", protect, checkProfile, updatePost);
router.delete("/:id", protect, checkProfile, deletePost);
router.put("/:id/like", protect, checkProfile, likePost);
router.post("/:id/comments", protect, checkProfile, addComment);
router.delete("/:postId/comments/:commentId", protect, checkProfile, deleteComment);

module.exports = router;

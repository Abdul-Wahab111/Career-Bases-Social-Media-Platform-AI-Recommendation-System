const express = require("express");
const {
  getMessages,
  saveMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:userId", protect, getMessages);
router.post("/", protect, saveMessage);

module.exports = router;

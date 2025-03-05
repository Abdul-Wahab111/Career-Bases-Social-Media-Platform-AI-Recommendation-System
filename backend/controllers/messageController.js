const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");

const getMessages = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  })
    .sort({ timestamp: 1 })
    .populate("sender", "name email")
    .populate("receiver", "name email");

  res.json(messages);
});

// Add new controller method to save messages
const saveMessage = asyncHandler(async (req, res) => {
  const { receiver, content } = req.body;
  const sender = req.user._id;

  const message = await Message.create({
    sender,
    receiver,
    content,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email")
    .populate("receiver", "name email");

  res.status(201).json(populatedMessage);
});

module.exports = { getMessages, saveMessage };

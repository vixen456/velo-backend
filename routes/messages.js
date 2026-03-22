const express = require('express');
const { Message } = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all my chats
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Message.getChats(req.user.id);
    res.json({ chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.getConversation(
      req.user.id,
      req.params.userId
    );

    // Mark messages as read
    await Message.markAsRead(req.params.userId, req.user.id);

    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/send', protect, async (req, res) => {
  try {
    const { receiver_id, content, message_type } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'Receiver and content required' });
    }

    const message = await Message.create(
      req.user.id,
      receiver_id,
      content,
      message_type || 'text'
    );

    res.status(201).json({
      message: 'Message sent ✅',
      data: message
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

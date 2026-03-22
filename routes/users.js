const express = require('express');
const { User } = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get my profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update my profile
router.put('/me', protect, async (req, res) => {
  try {
    const { full_name, username, bio } = req.body;

    const updated = await User.update(req.user.id, {
      full_name,
      username,
      bio
    });

    res.json({
      message: 'Profile updated ✅',
      user: updated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get any user by username
router.get('/:username', protect, async (req, res) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      is_online: user.is_online,
      last_seen: user.last_seen
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const { User } = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Check premium status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    const isActive = user.is_premium && 
      (user.premium_expires === null || new Date(user.premium_expires) > now);

    res.json({
      is_premium: isActive,
      expires: user.premium_expires,
      plan: isActive ? 'Premium' : 'Free'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Activate premium after payment
router.post('/activate', protect, async (req, res) => {
  try {
    const { plan } = req.body;

    let expires = new Date();

    if (plan === 'monthly') {
      expires.setMonth(expires.getMonth() + 1);
    } else if (plan === 'yearly') {
      expires.setFullYear(expires.getFullYear() + 1);
    } else if (plan === 'lifetime') {
      expires = null; // never expires
    } else {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.update(req.user.id, {
      is_premium: true,
      premium_expires: expires
    });

    res.json({
      message: `Velo Premium activated 👑`,
      is_premium: true,
      plan,
      expires
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if feature is available
router.get('/check/:feature', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    const isPremium = user.is_premium &&
      (user.premium_expires === null || new Date(user.premium_expires) > now);

    const premiumFeatures = [
      'large_files',
      'original_quality',
      'hidden_chats',
      'custom_themes',
      'large_groups',
      'verified_badge',
      'disappearing_messages'
    ];

    const feature = req.params.feature;
    const isPremiumFeature = premiumFeatures.includes(feature);

    if (isPremiumFeature && !isPremium) {
      return res.json({
        allowed: false,
        message: 'Upgrade to Velo Premium to use this feature 👑'
      });
    }

    res.json({ allowed: true });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel premium
router.post('/cancel', protect, async (req, res) => {
  try {
    await User.update(req.user.id, {
      is_premium: false,
      premium_expires: null
    });

    res.json({ message: 'Premium cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

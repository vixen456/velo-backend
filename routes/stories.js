const express = require('express');
const { Story } = require('../models/Story');
const { protect } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../config/cloudStorage');

const router = express.Router();

// Get all active stories
router.get('/', protect, async (req, res) => {
  try {
    const stories = await Story.getAll(req.user.id);
    res.json({ stories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stories by a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const stories = await Story.getByUser(req.params.userId);
    res.json({ stories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a text story
router.post('/text', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const story = await Story.create(
      req.user.id,
      content,
      null,
      'text'
    );
    res.status(201).json({
      message: 'Story posted ✅',
      story
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post an image story
router.post('/image', protect, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const story = await Story.create(
      req.user.id,
      req.body.content || '',
      req.file.path,
      'image'
    );
    res.status(201).json({
      message: 'Story posted ✅',
      story
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a video story
router.post('/video', protect, uploadVideo.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }
    const story = await Story.create(
      req.user.id,
      req.body.content || '',
      req.file.path,
      'video'
    );
    res.status(201).json({
      message: 'Story posted ✅',
      story
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View a story
router.put('/view/:storyId', protect, async (req, res) => {
  try {
    const story = await Story.addView(req.params.storyId);
    res.json({ story });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a story
router.delete('/:storyId', protect, async (req, res) => {
  try {
    const story = await Story.delete(req.params.storyId, req.user.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json({ message: 'Story deleted ✅' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

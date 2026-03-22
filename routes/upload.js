const express = require('express');
const { uploadImage, uploadVideo, uploadFile } = require('../config/cloudStorage');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Upload image
router.post('/image', protect, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'Image uploaded ✅',
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload video
router.post('/video', protect, uploadVideo.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'Video uploaded ✅',
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload any file
router.post('/file', protect, uploadFile.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'File uploaded ✅',
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;

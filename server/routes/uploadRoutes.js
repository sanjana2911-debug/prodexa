/**
 * Upload routes for profile images
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadAvatar, removeAvatar } = require('../controllers/uploadController');

router.use(protect);

// Upload profile avatar - single file, field name 'avatar'
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Remove profile avatar
router.delete('/avatar', removeAvatar);

module.exports = router;
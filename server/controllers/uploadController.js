/**
 * Upload controller - handles profile image uploads
 */
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

/**
 * @desc    Upload profile image
 * @route   POST /api/upload/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      const fullPublicId = `prodexa/avatars/${publicId}`;
      try {
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (err) {
        // Old image may not exist, continue
      }
    }

    // Update user's avatar URL in database
    user.avatar = req.file.path;
    await user.save();

    res.json({
      success: true,
      avatar: user.avatar,
      message: 'Profile picture updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove profile image (reset to default)
 * @route   DELETE /api/upload/avatar
 */
const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      const fullPublicId = `prodexa/avatars/${publicId}`;
      try {
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (err) {
        // Image may not exist, continue
      }
    }

    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      avatar: null,
      message: 'Profile picture removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAvatar, removeAvatar };
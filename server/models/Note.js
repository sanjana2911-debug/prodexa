/**
 * Note model for notes management
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#[0-9a-fA-F]{6}$/, 'Invalid color hex code'],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ user: 1, pinned: -1 });
noteSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Note', noteSchema);
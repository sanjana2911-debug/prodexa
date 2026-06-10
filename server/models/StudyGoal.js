/**
 * StudyGoal model for study planner goals
 */

const mongoose = require('mongoose');

const studyGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    target: {
      type: Number,
      required: [true, 'Target is required'],
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

studyGoalSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('StudyGoal', studyGoalSchema);
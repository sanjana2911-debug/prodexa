/**
 * ActivityLog model for tracking user actions
 * Used for audit trail and analytics
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN', 'LOGOUT', 'REGISTER',
        'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_COMPLETED',
        'ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED',
        'NOTE_CREATED', 'NOTE_UPDATED', 'NOTE_DELETED',
        'GOAL_CREATED', 'GOAL_UPDATED', 'GOAL_DELETED',
        'PROFILE_UPDATED', 'PASSWORD_RESET', 'PASSWORD_CHANGED',
      ],
    },
    resource: {
      type: String,
      default: null,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    expires: 90 * 24 * 60 * 60, // Auto-delete after 90 days (TTL index)
  }
);

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
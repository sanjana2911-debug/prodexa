/**
 * Activity logging middleware
 * Logs user actions for audit trail and analytics
 */

const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user activity
 * @param {string} action - Action type (e.g., 'TASK_CREATED')
 * @param {string} resource - Resource name (e.g., 'Task')
 * @param {ObjectId} resourceId - Resource document ID
 * @param {Object} metadata - Additional data to log
 */
const logActivity = (action, resource = null, resourceId = null, metadata = {}) => {
  return async (req, res, next) => {
    // Store original end to capture response
    const originalEnd = res.end;
    res.end = function (...args) {
      res.end = originalEnd;
      res.end.apply(this, args);
    };

    try {
      if (req.user) {
        await ActivityLog.create({
          user: req.user._id,
          action,
          resource,
          resourceId,
          metadata,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || null,
        });
      }
    } catch (err) {
      // Don't fail the request if logging fails
      console.error('Activity log error:', err.message);
    }

    if (next) next();
  };
};

/**
 * Simplified logger for use within controllers
 */
const createActivityLog = async (userId, action, resource, resourceId, metadata = {}, req = null) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      metadata,
      ip: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity, createActivityLog };
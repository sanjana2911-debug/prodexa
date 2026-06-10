/**
 * Authentication & Authorization middleware
 * Supports JWT verification, role-based access, and token refresh
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const cfg = require('../config/env');

/**
 * Verify JWT access token from Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('No token provided. Please log in.');
    }

    const decoded = jwt.verify(token, cfg.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    next(error);
  }
};

/**
 * Restrict access to specific roles
 * Usage: authorize('admin') or authorize('admin', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
};

/**
 * Optional auth - attaches user if token present, but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, cfg.jwtSecret);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    // Silently continue without user
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
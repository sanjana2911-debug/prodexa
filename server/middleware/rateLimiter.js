/**
 * Rate limiting middleware
 * Protects API from abuse using express-rate-limit
 */

const rateLimit = require('express-rate-limit');
const cfg = require('../config/env');

// General API rate limiter
// Skip auth routes since they have their own dedicated stricter limiter.
// Without this skip, a request to /api/auth/register gets counted by
// BOTH authLimiter AND apiLimiter, causing double-counting and false
// rate-limit hits.
const apiLimiter = rateLimit({
  windowMs: cfg.rateLimitWindowMs,
  max: cfg.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: (req) => req.originalUrl.startsWith('/api/auth/'),
});

// Strict limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min (allows normal usage + retries)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Strict limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in an hour.',
  },
});

module.exports = { apiLimiter, authLimiter, passwordResetLimiter };
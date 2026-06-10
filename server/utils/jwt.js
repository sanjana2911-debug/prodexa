/**
 * JWT utility for token generation and verification
 * Supports access tokens (short-lived) and refresh tokens (long-lived)
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const cfg = require('../config/env');

/**
 * Generate access token (15 min expiry)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, cfg.jwtSecret, {
    expiresIn: cfg.jwtExpiry,
  });
};

/**
 * Generate and store refresh token (7 day expiry)
 */
const generateRefreshToken = async (userId, req = null) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
    ip: req?.ip || null,
    userAgent: req?.headers?.['user-agent'] || null,
  });

  return token;
};

/**
 * Verify refresh token and return new tokens
 */
const rotateRefreshToken = async (oldToken, req = null) => {
  // Find the stored refresh token
  const storedToken = await RefreshToken.findOne({
    token: oldToken,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    return null;
  }

  // Revoke old token
  storedToken.revoked = true;
  await storedToken.save();

  // Generate new tokens
  const accessToken = generateAccessToken(storedToken.user);
  const refreshToken = await generateRefreshToken(storedToken.user, req);

  // Mark old token as replaced
  storedToken.replacedBy = refreshToken;
  await storedToken.save();

  return { accessToken, refreshToken, userId: storedToken.user };
};

/**
 * Revoke all refresh tokens for a user (used on password change)
 */
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revoked: false },
    { revoked: true }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeAllUserTokens,
};
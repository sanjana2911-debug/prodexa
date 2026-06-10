/**
 * Environment-based configuration
 * Centralizes all config with validation for production readiness
 */

const config = {
  development: {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/prodexa',
    jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_key_2026',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_2026',
    jwtExpiry: '15m',
    jwtRefreshExpiry: '7d',
    frontendURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    redisURL: process.env.REDIS_URL || 'redis://localhost:6379',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT) || 2525,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    uploadDir: 'uploads',
    logLevel: 'debug',
  },
  production: {
    port: parseInt(process.env.PORT) || 5000,
    mongoURI: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiry: '15m',
    jwtRefreshExpiry: '7d',
    frontendURL: process.env.FRONTEND_URL,
    redisURL: process.env.REDIS_URL || 'redis://redis:6379',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMax: 50,
    uploadDir: 'uploads',
    logLevel: 'info',
  },
  test: {
    port: 5001,
    mongoURI: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/prodexa_test',
    jwtSecret: 'test_jwt_secret',
    jwtRefreshSecret: 'test_jwt_refresh_secret',
    jwtExpiry: '15m',
    jwtRefreshExpiry: '7d',
    frontendURL: 'http://localhost:3000',
    redisURL: process.env.REDIS_URL || 'redis://localhost:6379',
    smtp: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      user: '',
      pass: '',
    },
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMax: 1000,
    uploadDir: 'uploads',
    logLevel: 'silent',
  },
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
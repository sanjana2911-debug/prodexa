/**
 * Winston logger for production-grade logging
 * Logs to console and files with different levels
 */

const winston = require('winston');
const path = require('path');
const cfg = require('../config/env');

const logDir = path.join(__dirname, '..', '..', 'logs');

const logger = winston.createLogger({
  level: cfg.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'prodexa-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
    // File transports (only in non-test)
    ...(process.env.NODE_ENV !== 'test'
      ? [
          new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

module.exports = logger;
/**
 * Prodexa Server - Production Entry Point
 * Express.js REST API with MongoDB, JWT auth, Redis caching,
 * Rate limiting, Swagger docs, File uploads, and more
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const cfg = require('./config/env');
const logger = require('./utils/logger');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import route files
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const noteRoutes = require('./routes/noteRoutes');
const studyGoalRoutes = require('./routes/studyGoalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = cfg.port;

// Trust proxy - Required for Render/Vercel/Heroku etc.
// Without this, all requests appear to come from the proxy IP,
// so ALL users share the same rate-limit bucket, causing false
// 'Too many requests' errors in production.
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: cfg.frontendURL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Request logging with real IP behind proxy
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });
  next();
});

// Rate limiting
// IMPORTANT ORDER: Auth-specific limiters must be applied BEFORE
// the general API limiter, so auth endpoints get their dedicated
// limits first. Also, the apiLimiter uses `skip` to exclude auth
// routes to prevent double-counting (requests should not be counted
// by both authLimiter AND apiLimiter).
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Prodexa API Docs',
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Prodexa API is running',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/study-goals', studyGoalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Swagger docs: http://localhost:${PORT}/api-docs`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; // Export for testing
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

const app = express();
const PORT = cfg.port;

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

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// Rate limiting - Auth limiters must be applied BEFORE general API limiter
// so login/register get their dedicated stricter limits first
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
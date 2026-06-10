/**
 * Analytics routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats, getMonthlyAnalytics } = require('../controllers/analyticsController');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyAnalytics);

module.exports = router;
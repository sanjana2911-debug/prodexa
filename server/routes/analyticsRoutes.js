/**
 * Analytics routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats, getMonthlyAnalytics, getAdminUserStats } = require('../controllers/analyticsController');
const { authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyAnalytics);
router.get('/admin/users', authorize('admin'), getAdminUserStats);

module.exports = router;
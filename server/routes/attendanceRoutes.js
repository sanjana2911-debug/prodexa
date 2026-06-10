/**
 * Attendance routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAttendance, markAttendance, getAttendanceStats } = require('../controllers/attendanceController');

router.use(protect);

router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);
router.post('/', markAttendance);

module.exports = router;
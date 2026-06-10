/**
 * Attendance controller - CRUD for class attendance
 */

const Attendance = require('../models/Attendance');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get attendance records for current user
 * @route   GET /api/attendance
 */
const getAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark attendance for a specific date
 * @route   POST /api/attendance
 */
const markAttendance = async (req, res, next) => {
  try {
    const { date, status, subject } = req.body;
    
    // Upsert: update if exists, create if not
    const record = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: new Date(date) },
      { status, subject: subject || 'General' },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance statistics
 * @route   GET /api/attendance/stats
 */
const getAttendanceStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query);
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      success: true,
      stats: { total, present, absent, percentage },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAttendance, markAttendance, getAttendanceStats };
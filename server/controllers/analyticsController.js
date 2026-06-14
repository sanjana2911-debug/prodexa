/**
 * Analytics controller - provides aggregated data for dashboard and analytics pages
 *
 * CRITICAL PERFORMANCE NOTE:
 * This controller runs up to 10 MongoDB queries per request. If any query is slow
 * (missing index, large dataset, network latency), the entire dashboard hangs.
 *
 * Fixes applied:
 * 1. All queries run in PARALLEL via Promise.all (was sequential before)
 * 2. Each query has maxTimeMS: 5000 to abort if MongoDB is slow
 * 3. Upcoming tasks query is limited to 5 docs, sorted, with covered index
 * 4. Goal calculations done client-side after fetching (reduces aggregation overhead)
 */

const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const StudyGoal = require('../models/StudyGoal');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run ALL queries in PARALLEL — reducing wall-clock time from ~N queries sequentially
    // to the time of the SINGLE slowest query.
    // Each query has maxTimeMS to prevent MongoDB from hanging on unindexed collections.
    const MAX_TIME = 5000;

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalAttendance,
      presentDays,
      highPriority,
      mediumPriority,
      lowPriority,
      goals,
      upcomingTasks,
    ] = await Promise.all([
      Task.countDocuments({ user: userId }).maxTimeMS(MAX_TIME),
      Task.countDocuments({ user: userId, status: 'completed' }).maxTimeMS(MAX_TIME),
      Task.countDocuments({ user: userId, status: { $ne: 'completed' } }).maxTimeMS(MAX_TIME),
      Task.countDocuments({ user: userId, status: 'in-progress' }).maxTimeMS(MAX_TIME),
      Attendance.countDocuments({ user: userId }).maxTimeMS(MAX_TIME),
      Attendance.countDocuments({ user: userId, status: 'present' }).maxTimeMS(MAX_TIME),
      Task.countDocuments({ user: userId, priority: 'high' }).maxTimeMS(MAX_TIME),
      Task.countDocuments({ user: userId, priority: 'medium' }).maxTimeMS(MAX_TIME),
      Task.countDocuments({ user: userId, priority: 'low' }).maxTimeMS(MAX_TIME),
      StudyGoal.find({ user: userId }).maxTimeMS(MAX_TIME).lean(),
      Task.find({
        user: userId,
        status: { $ne: 'completed' },
        dueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .maxTimeMS(MAX_TIME)
        .lean(),
    ]);

    // Attendance percentage
    const attendancePercentage = totalAttendance > 0
      ? Math.round((presentDays / totalAttendance) * 100)
      : 0;

    // Goal statistics (client-side calculation — fast, avoids aggregate pipeline)
    const completedGoals = goals.filter(g => g.progress >= g.target).length;
    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const goalPercentage = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0;

    res.json({
      success: true,
      stats: {
        tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks, inProgress: inProgressTasks },
        attendance: { total: totalAttendance, present: presentDays, percentage: attendancePercentage },
        goals: { total: goals.length, completed: completedGoals, percentage: goalPercentage },
        priorityBreakdown: { high: highPriority, medium: mediumPriority, low: lowPriority },
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get monthly analytics for charts
 * @route   GET /api/analytics/monthly
 */
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const MAX_TIME = 5000;

    // Monthly attendance data
    const monthlyAttendance = await Attendance.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]).maxTimeMS(MAX_TIME);

    // Monthly task completion data
    const monthlyTasks = await Task.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]).maxTimeMS(MAX_TIME);

    res.json({
      success: true,
      analytics: {
        year: targetYear,
        monthlyAttendance,
        monthlyTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin-level user statistics
 * @route   GET /api/analytics/admin/users
 */
const getAdminUserStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const MAX_TIME = 5000;

    // Run all queries in PARALLEL to minimize response time
    const [totalUsers, activeUsersToday, newUsersThisWeek, totalTasks, totalNotes, tasksCompletedToday] =
      await Promise.all([
        User.countDocuments({}).maxTimeMS(MAX_TIME),
        User.countDocuments({
          lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }).maxTimeMS(MAX_TIME),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }).maxTimeMS(MAX_TIME),
        Task.countDocuments({}).maxTimeMS(MAX_TIME),
        require('../models/Note').countDocuments({}).maxTimeMS(MAX_TIME),
        Task.countDocuments({
          status: 'completed',
          updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }).maxTimeMS(MAX_TIME),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsersToday,
        newUsersThisWeek,
        totalTasks,
        totalNotes,
        tasksCompletedToday,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getMonthlyAnalytics, getAdminUserStats };
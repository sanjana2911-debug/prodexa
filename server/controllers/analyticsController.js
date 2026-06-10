/**
 * Analytics controller - provides aggregated data for dashboard and analytics pages
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

    // Task statistics
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ user: userId, status: { $ne: 'completed' } });
    const inProgressTasks = await Task.countDocuments({ user: userId, status: 'in-progress' });

    // Attendance statistics
    const totalAttendance = await Attendance.countDocuments({ user: userId });
    const presentDays = await Attendance.countDocuments({ user: userId, status: 'present' });
    const attendancePercentage = totalAttendance > 0
      ? Math.round((presentDays / totalAttendance) * 100)
      : 0;

    // Study goal statistics
    const goals = await StudyGoal.find({ user: userId });
    const completedGoals = goals.filter(g => g.progress >= g.target).length;
    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const goalPercentage = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0;

    // Priority breakdown
    const highPriority = await Task.countDocuments({ user: userId, priority: 'high' });
    const mediumPriority = await Task.countDocuments({ user: userId, priority: 'medium' });
    const lowPriority = await Task.countDocuments({ user: userId, priority: 'low' });

    // Upcoming tasks (due within next 7 days, not completed)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingTasks = await Task.find({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $lte: nextWeek },
    }).sort({ dueDate: 1 }).limit(5);

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
    ]);

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
    ]);

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

module.exports = { getDashboardStats, getMonthlyAnalytics };
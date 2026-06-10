/**
 * Analytics page - Task completion charts, attendance charts, and productivity summary
 */
import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMonthName } from '../utils/helpers';
import { analyticsAPI } from '../services/api';
import { FiBarChart2, FiCheckCircle, FiClock, FiTrendingUp, FiAlertCircle, FiUsers, FiFileText, FiTarget, FiUserPlus, FiActivity } from 'react-icons/fi';

export default function Analytics() {
  const { tasks, attendance, studyGoals, getStatistics, loading, error, monthlyAnalytics, fetchMonthlyAnalytics } = useData();
  const { user } = useAuth();
  const stats = getStatistics();
  const [adminStats, setAdminStats] = useState(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);

  // Fetch admin stats if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      setAdminStatsLoading(true);
      analyticsAPI.getAdminUserStats()
        .then(res => setAdminStats(res.data.stats))
        .catch(err => console.error('Failed to fetch admin stats:', err))
        .finally(() => setAdminStatsLoading(false));
    }
  }, [user?.role]);

  useEffect(() => {
    const year = new Date().getFullYear();
    fetchMonthlyAnalytics(year);
  }, [fetchMonthlyAnalytics]);

  // Calculate task completion rate
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  // Priority breakdown
  const priorityCounts = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  const totalByPriority = priorityCounts.high + priorityCounts.medium + priorityCounts.low;

  // Monthly attendance data from analytics API
  const monthlyAttendanceData = {};
  if (monthlyAnalytics?.monthlyAttendance) {
    monthlyAnalytics.monthlyAttendance.forEach(item => {
      const month = item._id.month;
      if (!monthlyAttendanceData[month]) {
        monthlyAttendanceData[month] = { present: 0, absent: 0, total: 0 };
      }
      monthlyAttendanceData[month].total += item.count;
      if (item._id.status === 'present') monthlyAttendanceData[month].present += item.count;
      else monthlyAttendanceData[month].absent += item.count;
    });
  } else {
    // Fallback: calculate from local attendance data
    attendance.forEach(a => {
      const date = new Date(a.date);
      const month = date.getMonth();
      if (!monthlyAttendanceData[month]) {
        monthlyAttendanceData[month] = { present: 0, absent: 0, total: 0 };
      }
      monthlyAttendanceData[month].total++;
      if (a.status === 'present') monthlyAttendanceData[month].present++;
      else monthlyAttendanceData[month].absent++;
    });
  }

  // Goals completion
  const completedGoals = studyGoals.filter(g => g.progress >= g.target).length;
  const totalGoals = studyGoals.length;
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3">
        <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your productivity and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Task Completion</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <FiBarChart2 className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.attendancePercentage}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.attendancePercentage}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalCompletionRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Goals Progress</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${goalCompletionRate}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
              <FiClock className="text-2xl text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Task Priority Distribution</h3>
          {totalByPriority > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-red-600 dark:text-red-400 font-medium">High Priority</span>
                  <span className="text-gray-500 dark:text-gray-400">{priorityCounts.high} tasks</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(priorityCounts.high / totalByPriority) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Medium Priority</span>
                  <span className="text-gray-500 dark:text-gray-400">{priorityCounts.medium} tasks</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${(priorityCounts.medium / totalByPriority) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-green-600 dark:text-green-400 font-medium">Low Priority</span>
                  <span className="text-gray-500 dark:text-gray-400">{priorityCounts.low} tasks</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(priorityCounts.low / totalByPriority) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No tasks to analyze. Create some tasks first!</p>
          )}
        </div>

        {/* Task Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Task Status Overview</h3>
          {stats.totalTasks > 0 ? (
            <div className="flex items-center justify-center h-48">
              <div className="relative w-40 h-40">
                {/* Simple donut chart using conic-gradient */}
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(
                      #22c55e 0% ${(stats.completedTasks / stats.totalTasks) * 100}%,
                      #eab308 ${(stats.completedTasks / stats.totalTasks) * 100}% ${((stats.completedTasks + stats.pendingTasks) / stats.totalTasks) * 100}%,
                      #3b82f6 ${((stats.completedTasks + stats.pendingTasks) / stats.totalTasks) * 100}% 100%
                    )`,
                  }}
                >
                  <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No data available. Start creating tasks!</p>
          )}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Completed ({stats.completedTasks})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Pending ({stats.pendingTasks})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Attendance Summary</h3>
        {Object.keys(monthlyAttendanceData).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(monthlyAttendanceData).reverse().slice(0, 6).map(([month, data]) => {
              const monthName = getMonthName(parseInt(month));
              const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
              return (
                <div key={month} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-28">
                    {monthName}
                  </span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">{data.present}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{data.absent}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No attendance data available. Start marking attendance!</p>
        )}
      </div>

      {/* Productivity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Productivity Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Tasks Completed</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.completedTasks}</p>
            <p className="text-xs text-green-500 dark:text-green-500 mt-1">
              {stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% of total` : 'No tasks yet'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Days Present</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {attendance.filter(a => a.status === 'present').length}
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-500 mt-1">
              out of {attendance.length} days
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Goals Achieved</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{completedGoals}</p>
            <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
              {totalGoals > 0 ? `${goalCompletionRate}% completion rate` : 'No goals set'}
            </p>
          </div>
        </div>
      </div>

      {/* Admin User Statistics Panel */}
      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <FiUsers className="text-lg text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Platform Statistics</h3>
          </div>
          {adminStatsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : adminStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 text-center">
                <FiUsers className="text-2xl text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{adminStats.totalUsers}</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400">Total Users</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center">
                <FiActivity className="text-2xl text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{adminStats.activeUsersToday}</p>
                <p className="text-xs text-green-500 dark:text-green-400">Active Today</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 text-center">
                <FiUserPlus className="text-2xl text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{adminStats.newUsersThisWeek}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">New This Week</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 text-center">
                <FiCheckCircle className="text-2xl text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{adminStats.totalTasks}</p>
                <p className="text-xs text-orange-500 dark:text-orange-400">Total Tasks</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 text-center">
                <FiFileText className="text-2xl text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{adminStats.totalNotes}</p>
                <p className="text-xs text-pink-500 dark:text-pink-400">Total Notes</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 text-center">
                <FiTrendingUp className="text-2xl text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{adminStats.tasksCompletedToday}</p>
                <p className="text-xs text-teal-500 dark:text-teal-400">Done Today</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Unable to load platform statistics</p>
          )}
        </div>
      )}
    </div>
  );
}
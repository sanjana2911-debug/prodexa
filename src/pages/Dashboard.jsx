/**
 * Dashboard page - Welcome section, statistics cards, recent activities, and quick actions
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatDate, formatDateTime } from '../utils/helpers';
import { FiCheckSquare, FiClock, FiCalendar, FiTrendingUp, FiPlus, FiFileText, FiTarget, FiArrowRight } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const { getStatistics, getRecentActivities, tasks } = useData();
  const stats = getStatistics();
  const activities = getRecentActivities();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Stat cards configuration
  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: FiCheckSquare,
      color: 'bg-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      icon: FiTrendingUp,
      color: 'bg-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Pending',
      value: stats.pendingTasks,
      icon: FiClock,
      color: 'bg-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Attendance',
      value: `${stats.attendancePercentage}%`,
      icon: FiCalendar,
      color: 'bg-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  // Quick action buttons
  const quickActions = [
    { label: 'Add Task', path: '/tasks', icon: FiPlus, color: 'bg-primary-500' },
    { label: 'Mark Attendance', path: '/attendance', icon: FiCalendar, color: 'bg-green-500' },
    { label: 'Create Note', path: '/notes', icon: FiFileText, color: 'bg-purple-500' },
    { label: 'Set Goal', path: '/study-planner', icon: FiTarget, color: 'bg-orange-500' },
  ];

  // Upcoming tasks (due soon, not completed)
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-primary-100 text-sm lg:text-base">
          Here's your productivity overview for today. {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {user?.course || 'Student'}
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            Semester {user?.semester || 'N/A'}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`text-lg ${card.textColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
            <Link to="/tasks" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="p-4">
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(task.dueDate)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No tasks available</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
          </div>
          <div className="p-4">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start gap-3 p-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'task_created' ? 'bg-blue-500' :
                      activity.type === 'attendance' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                <action.icon className="text-xl" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
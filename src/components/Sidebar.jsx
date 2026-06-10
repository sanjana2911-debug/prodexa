/**
 * Sidebar component provides navigation for the application
 * Uses react-router-dom for navigation and react-icons for icons
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiGrid, FiCheckSquare, FiCalendar, FiFileText, FiTarget, FiUser, FiBarChart2, FiLogOut, FiSun, FiMoon, FiMessageSquare } from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { path: '/attendance', icon: FiCalendar, label: 'Attendance' },
  { path: '/notes', icon: FiFileText, label: 'Notes' },
  { path: '/study-planner', icon: FiTarget, label: 'Study Planner' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { path: '/feedback', icon: FiMessageSquare, label: 'Feedback' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Prodexa</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Student Platform</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Menu
          </p>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`
              }
            >
              <Icon className="text-lg flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 mb-2"
          >
            {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
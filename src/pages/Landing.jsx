/**
 * Landing page - Public homepage explaining Prodexa
 */
import { Link } from 'react-router-dom';
import { FiCheckSquare, FiCalendar, FiFileText, FiTarget, FiBarChart2, FiMoon, FiShield, FiZap } from 'react-icons/fi';

const features = [
  { icon: FiCheckSquare, title: 'Task Manager', desc: 'Organize assignments, projects, and deadlines with priority levels and due dates.' },
  { icon: FiCalendar, title: 'Attendance Tracker', desc: 'Mark presence/absence with a visual calendar and monthly statistics.' },
  { icon: FiFileText, title: 'Smart Notes', desc: 'Create categorized notes with color coding, pinning, and full-text search.' },
  { icon: FiTarget, title: 'Study Planner', desc: 'Set daily and weekly goals with progress tracking and completion metrics.' },
  { icon: FiBarChart2, title: 'Analytics Dashboard', desc: 'Visualize your productivity with charts, stats, and performance insights.' },
  { icon: FiMoon, title: 'Dark Mode', desc: 'Switch between light and dark themes for comfortable use day or night.' },
];

const stats = [
  { value: '100%', label: 'Free to Use' },
  { value: 'Zero', label: 'Ads or Distractions' },
  { value: 'Real-time', label: 'Data Persistence' },
  { value: 'Mobile', label: 'Responsive Design' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Prodexa</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm">Sign In</Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <FiZap className="text-sm" />
              Built for Students
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Your All-in-One{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Student Productivity
              </span>{' '}
              Platform
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Manage tasks, track attendance, take notes, plan studies, and analyze your productivity — all in one beautiful, free platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-xl shadow-primary-500/30 hover:shadow-2xl">
                Start for Free
              </Link>
              <Link to="/login" className="px-8 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">No credit card required • Free forever</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Powerful tools designed specifically for students to stay organized and productive.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="text-xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Boost Your Productivity?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">Join other students who are already using Prodexa to stay organized.</p>
          <Link to="/register" className="inline-block px-8 py-3.5 bg-white text-primary-700 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-white font-semibold">Prodexa</span>
          </div>
          <p className="text-sm">Built with ❤️ for students. © 2026 Prodexa.</p>
        </div>
      </footer>
    </div>
  );
}
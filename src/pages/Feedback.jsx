/**
 * Feedback/Report Bug page
 */
import { useState } from 'react';
import { FiSend, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';

const FEEDBACK_TYPES = [
  { value: 'feature', label: 'Feature Request', icon: FiMessageSquare },
  { value: 'bug', label: 'Bug Report', icon: FiAlertTriangle },
  { value: 'general', label: 'General Feedback', icon: FiMessageSquare },
];

export default function Feedback() {
  const [form, setForm] = useState({ type: 'feature', title: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    
    // In production, this would send to an API endpoint
    const feedbackData = {
      ...form,
      timestamp: new Date().toISOString(),
      user: JSON.parse(localStorage.getItem('prodexa_user') || '{}').email || 'anonymous',
    };
    console.log('Feedback submitted:', feedbackData);
    
    // Store in localStorage for demo
    const existing = JSON.parse(localStorage.getItem('prodexa_feedback') || '[]');
    existing.push(feedbackData);
    localStorage.setItem('prodexa_feedback', JSON.stringify(existing));
    
    setSubmitted(true);
    setForm({ type: 'feature', title: '', description: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback & Support</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Help us improve Prodexa. Report bugs or suggest features.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSend className="text-2xl text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Thank You!</h3>
            <p className="text-gray-500 dark:text-gray-400">Your feedback has been recorded. We appreciate your input!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-3">
                {FEEDBACK_TYPES.map(ft => (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: ft.value }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      form.type === ft.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <ft.icon className={`text-xl ${form.type === ft.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${form.type === ft.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your feedback"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your feedback or bug report in detail..."
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2"
            >
              <FiSend />
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
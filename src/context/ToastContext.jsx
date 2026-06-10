/**
 * Toast notification context for user-friendly success/error messages
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

const TOAST_TYPES = {
  success: { icon: FiCheckCircle, bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200', iconColor: 'text-green-500' },
  error: { icon: FiXCircle, bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200', iconColor: 'text-red-500' },
  warning: { icon: FiAlertTriangle, bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200', iconColor: 'text-yellow-500' },
  info: { icon: FiInfo, bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200', iconColor: 'text-blue-500' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error', 6000);
  const showWarning = (msg) => addToast(msg, 'warning', 5000);
  const showInfo = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const style = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={`${style.bg} ${style.border} ${style.text} border rounded-xl shadow-lg p-4 pointer-events-auto animate-slideIn flex items-start gap-3`}
            >
              <Icon className={`${style.iconColor} text-xl flex-shrink-0 mt-0.5`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
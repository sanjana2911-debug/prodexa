/**
 * Tasks page - Full CRUD task management with search, filter, priority, and due dates
 */
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getPriorityColor, getStatusColor, getTodayDate, isPastDate } from '../utils/helpers';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCheckCircle, FiCircle, FiFilter, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, loading, error } = useData();
  const { confirm } = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: getTodayDate(),
    category: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: getTodayDate(),
      category: '',
    });
    setEditingTask(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : getTodayDate(),
      category: task.category,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || submitting) return;

    try {
      setSubmitting(true);
      if (editingTask) {
        await updateTask(editingTask._id, formData);
      } else {
        await addTask(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleToggleStatus = async (taskId) => {
    try {
      await toggleTaskStatus(taskId);
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Sort by due date (nearest first), then by priority (high first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  });

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your tasks efficiently</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
        >
          <FiPlus />
          <span>Add Task</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <div
              key={task._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all animate-fadeIn"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleStatus(task._id)}
                  className={`mt-1 flex-shrink-0 transition-colors ${
                    task.status === 'completed'
                      ? 'text-green-500'
                      : 'text-gray-300 dark:text-gray-600 hover:text-green-500'
                  }`}
                >
                  {task.status === 'completed' ? <FiCheckCircle className="text-xl" /> : <FiCircle className="text-xl" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {task.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {task.category}
                      </span>
                    )}
                    <span className={`text-xs ${isPastDate(task.dueDate) && task.status !== 'completed' ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                      Due: {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <FiCheckSquare className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            <button onClick={handleOpenAdd} className="mt-3 text-primary-600 dark:text-primary-400 font-medium text-sm hover:underline">
              Create your first task
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Assignment, Study, Project"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
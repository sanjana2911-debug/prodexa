/**
 * Study Planner page - Daily/Weekly goals with progress tracking
 */
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculatePercentage } from '../utils/helpers';
import { FiPlus, FiTarget, FiEdit2, FiTrash2, FiTrendingUp, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function StudyPlanner() {
  const { studyGoals, addStudyGoal, updateStudyGoal, deleteStudyGoal, loading, error } = useData();
  const { confirm } = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    progress: 0,
    target: 10,
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'daily', progress: 0, target: 10 });
    setEditingGoal(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      type: goal.type,
      progress: goal.progress,
      target: goal.target,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || submitting) return;

    try {
      setSubmitting(true);
      if (editingGoal) {
        await updateStudyGoal(editingGoal._id, formData);
      } else {
        await addStudyGoal(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (goalId) => {
    const confirmed = await confirm({
      title: 'Delete Goal',
      message: 'Are you sure you want to delete this study goal? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await deleteStudyGoal(goalId);
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    const goal = studyGoals.find(g => g._id === goalId);
    if (goal) {
      try {
        await updateStudyGoal(goalId, { progress: Math.max(0, Math.min(newProgress, goal.target)) });
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    }
  };

  // Filter goals
  const filteredGoals = studyGoals.filter(goal => {
    if (filterType === 'all') return true;
    return goal.type === filterType;
  });

  // Calculate overall progress
  const totalProgress = filteredGoals.reduce((sum, g) => sum + g.progress, 0);
  const totalTarget = filteredGoals.reduce((sum, g) => sum + g.target, 0);
  const overallPercentage = calculatePercentage(totalProgress, totalTarget);

  const goalTypes = ['all', 'daily', 'weekly'];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set and track your study goals</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
        >
          <FiPlus />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Overall Progress</h3>
            <p className="text-primary-100 text-sm">{totalProgress} / {totalTarget} completed</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{overallPercentage}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2">
        {goalTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filterType === type
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {type === 'all' ? 'All Goals' : type === 'daily' ? 'Daily Goals' : 'Weekly Goals'}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="space-y-4">
          {filteredGoals.map(goal => {
            const percentage = calculatePercentage(goal.progress, goal.target);
            const isComplete = goal.progress >= goal.target;

            return (
              <div
                key={goal._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all animate-fadeIn"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isComplete
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    }`}>
                      {isComplete ? <FiCheckCircle className="text-xl" /> : <FiTarget className="text-xl" />}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {goal.progress} / {goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick progress controls */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    goal.type === 'daily'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {goal.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProgressUpdate(goal._id, goal.progress - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-center">
                      {goal.progress}
                    </span>
                    <button
                      onClick={() => handleProgressUpdate(goal._id, goal.progress + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <FiTarget className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No goals set yet. Create your first study goal!</p>
          <button onClick={handleOpenAdd} className="mt-3 text-primary-600 dark:text-primary-400 font-medium text-sm hover:underline">
            Create your first goal
          </button>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingGoal ? 'Edit Goal' : 'Add New Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Goal title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Goal description"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: Number(e.target.value) }))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
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
              {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
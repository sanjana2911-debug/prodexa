/**
 * Study Goal controller - CRUD for study planner goals
 */

const StudyGoal = require('../models/StudyGoal');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all study goals for current user
 * @route   GET /api/study-goals
 */
const getStudyGoals = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { user: req.user._id };

    if (type && ['daily', 'weekly'].includes(type)) {
      query.type = type;
    }

    const goals = await StudyGoal.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a study goal
 * @route   POST /api/study-goals
 */
const createStudyGoal = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const goal = await StudyGoal.create(req.body);
    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a study goal
 * @route   PUT /api/study-goals/:id
 */
const updateStudyGoal = async (req, res, next) => {
  try {
    const goal = await StudyGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) throw ApiError.notFound('Study goal not found');
    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a study goal
 * @route   DELETE /api/study-goals/:id
 */
const deleteStudyGoal = async (req, res, next) => {
  try {
    const goal = await StudyGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) throw ApiError.notFound('Study goal not found');
    res.json({ success: true, message: 'Study goal deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get study goal progress summary
 * @route   GET /api/study-goals/progress
 */
const getProgress = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { user: req.user._id };

    if (type && ['daily', 'weekly'].includes(type)) {
      query.type = type;
    }

    const goals = await StudyGoal.find(query);
    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const completedGoals = goals.filter(g => g.progress >= g.target).length;
    const percentage = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0;

    res.json({
      success: true,
      progress: {
        totalGoals: goals.length,
        completedGoals,
        totalProgress,
        totalTarget,
        percentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudyGoals, createStudyGoal, updateStudyGoal, deleteStudyGoal, getProgress };
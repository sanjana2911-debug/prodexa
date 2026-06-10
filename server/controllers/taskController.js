/**
 * Task controller - Full CRUD for user tasks
 */

const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all tasks for current user
 * @route   GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const query = { user: req.user._id };

    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      query.status = status;
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) throw ApiError.notFound('Task not found');
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a task
 * @route   POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) throw ApiError.notFound('Task not found');
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) throw ApiError.notFound('Task not found');
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
/**
 * Note controller - Full CRUD for user notes
 */

const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all notes for current user
 * @route   GET /api/notes
 */
const getNotes = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single note
 * @route   GET /api/notes/:id
 */
const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) throw ApiError.notFound('Note not found');
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a note
 * @route   POST /api/notes
 */
const createNote = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const note = await Note.create(req.body);
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 */
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) throw ApiError.notFound('Note not found');
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) throw ApiError.notFound('Note not found');
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
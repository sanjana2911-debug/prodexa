/**
 * Study Goal routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStudyGoals, createStudyGoal, updateStudyGoal, deleteStudyGoal, getProgress } = require('../controllers/studyGoalController');

router.use(protect);

router.get('/', getStudyGoals);
router.get('/progress', getProgress);
router.post('/', createStudyGoal);
router.put('/:id', updateStudyGoal);
router.delete('/:id', deleteStudyGoal);

module.exports = router;
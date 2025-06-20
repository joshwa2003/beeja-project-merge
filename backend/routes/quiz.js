const express = require('express');
const router = express.Router();

// Import controllers
const { auth, isInstructor, isStudent, isAdmin } = require('../middleware/auth');
const {
  createQuiz,
  updateQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizResults,
  validateSectionAccess,
  submitQuiz,
  getQuizStatus
} = require('../controllers/quiz');

// Routes
router.get('/all', auth, getAllQuizzes);
router.post('/create', auth, isAdmin, createQuiz);
router.get('/status/:quizId', auth, getQuizStatus);
router.get('/results/:quizId', auth, getQuizResults);
router.get('/validate-access/:sectionId', auth, validateSectionAccess);
router.get('/:quizId', auth, getQuizById);
router.put('/update/:quizId', auth, isAdmin, updateQuiz);
router.post('/submit', auth, isStudent, submitQuiz);

module.exports = router;

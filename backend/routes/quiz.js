const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz');
const { auth, isInstructor } = require('../middleware/auth');

// Create a new quiz (instructor only)
router.post('/create', auth, isInstructor, quizController.createQuiz);

// Update an existing quiz (instructor only)
router.put('/update/:quizId', auth, isInstructor, quizController.updateQuiz);

// Get all quizzes (instructor only)
router.get('/all', auth, isInstructor, quizController.getAllQuizzes);

// Get quiz by ID
router.get('/:quizId', auth, quizController.getQuizById);

// Get quiz results
router.get('/results/:quizId', auth, quizController.getQuizResults);

// Validate section access
router.get('/validate-access/:sectionId', auth, quizController.validateSectionAccess);

// Submit quiz answers
router.post('/submit', auth, quizController.submitQuiz);

module.exports = router;

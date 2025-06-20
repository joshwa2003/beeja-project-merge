const Quiz = require('../models/quiz');
const CourseProgress = require('../models/courseProgress');
const SubSection = require('../models/subSection');

// Create a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { subSectionId, questions } = req.body;

        if (!subSectionId || !questions) {
            return res.status(400).json({
                success: false,
                message: 'SubSection ID and questions are required'
            });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length < 1 || questions.length > 25) {
            return res.status(400).json({
                success: false,
                message: 'Questions must be an array with 1 to 25 items'
            });
        }

        // Check if quiz already exists for this subsection
        const existingQuiz = await Quiz.findOne({ subSection: subSectionId });
        if (existingQuiz) {
            return res.status(400).json({
                success: false,
                message: 'Quiz already exists for this subsection'
            });
        }

        // Create quiz
        const quiz = await Quiz.create({
            subSection: subSectionId,
            questions
        });

        // Update subsection with quiz reference
        await SubSection.findByIdAndUpdate(subSectionId, { quiz: quiz._id });

        return res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: quiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating quiz',
            error: error.message
        });
    }
};

// Update an existing quiz
exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questions } = req.body;

        if (!questions) {
            return res.status(400).json({
                success: false,
                message: 'Questions are required'
            });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length < 1 || questions.length > 25) {
            return res.status(400).json({
                success: false,
                message: 'Questions must be an array with 1 to 25 items'
            });
        }

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            { questions },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            data: quiz
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating quiz',
            error: error.message
        });
    }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({})
            .populate('subSection', 'title')
            .sort({ createdAt: -1 });

        // Transform the data to include a title field for the frontend
        const transformedQuizzes = quizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.subSection ? `Quiz for ${quiz.subSection.title}` : 'Untitled Quiz',
            subSection: quiz.subSection,
            questions: quiz.questions,
            createdAt: quiz.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: transformedQuizzes
        });
    } catch (error) {
        console.error('Error fetching all quizzes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching quizzes',
            error: error.message
        });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching quiz',
            error: error.message
        });
    }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const courseProgress = await CourseProgress.findOne({
            userId,
            'quizResults.quiz': quizId
        });

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: 'No quiz results found'
            });
        }

        const quizResult = courseProgress.quizResults.find(
            result => result.quiz.toString() === quizId
        );

        return res.status(200).json({
            success: true,
            data: quizResult
        });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching quiz results',
            error: error.message
        });
    }
};

// Validate section access
exports.validateSectionAccess = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const userId = req.user.id;

        // Get all subsections in the section with quizzes
        const subsections = await SubSection.find({
            section: sectionId,
            quiz: { $exists: true }
        }).sort('createdAt');

        if (!subsections.length) {
            return res.status(200).json({
                success: true,
                canAccess: true
            });
        }

        // Get user's course progress
        const courseProgress = await CourseProgress.findOne({ userId });
        
        if (!courseProgress) {
            return res.status(200).json({
                success: true,
                canAccess: subsections[0]._id === sectionId
            });
        }

        // Check if all previous quizzes are passed with 60% or higher
        for (const subsection of subsections) {
            if (subsection._id === sectionId) {
                break;
            }
            
            if (!courseProgress.passedQuizzes.includes(subsection._id)) {
                return res.status(200).json({
                    success: true,
                    canAccess: false,
                    message: 'Pass previous quizzes with at least 60% to unlock this section'
                });
            }
        }

        return res.status(200).json({
            success: true,
            canAccess: true
        });
    } catch (error) {
        console.error('Error validating section access:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validating section access',
            error: error.message
        });
    }
};

// Submit quiz answers and validate
// Get quiz status (passed/failed/attempts)
exports.getQuizStatus = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const courseProgress = await CourseProgress.findOne({
            userId,
            'quizResults.quiz': quizId
        });

        if (!courseProgress) {
            return res.status(200).json({
                success: true,
                data: {
                    attempts: 0,
                    passed: false,
                    lastAttempt: null
                }
            });
        }

        const quizResult = courseProgress.quizResults.find(
            result => result.quiz.toString() === quizId
        );

        if (!quizResult) {
            return res.status(200).json({
                success: true,
                data: {
                    attempts: 0,
                    passed: false,
                    lastAttempt: null
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                attempts: quizResult.attempts,
                passed: quizResult.passed,
                lastAttempt: {
                    score: quizResult.score,
                    totalMarks: quizResult.totalMarks,
                    percentage: quizResult.percentage,
                    completedAt: quizResult.completedAt
                }
            }
        });
    } catch (error) {
        console.error('Error getting quiz status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting quiz status',
            error: error.message
        });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, courseId, subsectionId, answers } = req.body;
        const userId = req.user.id;

        if (!quizId || !answers) {
            return res.status(400).json({
                success: false,
                message: 'quizId and answers are required'
            });
        }

        // Find quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Find existing course progress
        let courseProgress = await CourseProgress.findOne({ userId, courseID: courseId });
        
        // Check if quiz is already passed
        const existingResult = courseProgress?.quizResults?.find(
            result => result.quiz.toString() === quiz._id.toString() && result.passed
        );
        
        if (existingResult) {
            return res.status(400).json({
                success: false,
                message: 'Quiz already passed. Retakes not allowed for passed quizzes.',
                data: {
                    score: existingResult.score,
                    totalMarks: existingResult.totalMarks,
                    percentage: existingResult.percentage,
                    passed: true
                }
            });
        }

        // Validate required questions and calculate score
        let score = 0;
        let totalMarks = 0;
        const unansweredQuestions = [];

        for (let i = 0; i < quiz.questions.length; i++) {
            const question = quiz.questions[i];
            const questionId = question._id.toString();
            
            totalMarks += question.marks;

            // Check if question is answered based on question type
            let isAnswered = false;
            let isCorrect = false;

            // Check if answer exists for this question
            const answer = answers[questionId];

            if (question.questionType === 'matchTheFollowing') {
                // For match the following, check if all pairs are answered
                const hasAllMatches = question.options.every((_, optionIndex) => {
                    const matchAnswer = answers[`${questionId}_${optionIndex}`];
                    return matchAnswer !== undefined && matchAnswer !== null && matchAnswer !== '';
                });
                isAnswered = hasAllMatches;
                
                if (isAnswered) {
                    // Check if ALL matches are correct - if any one is wrong, entire question is wrong
                    isCorrect = question.options.every((_, optionIndex) => {
                        const userAnswer = answers[`${questionId}_${optionIndex}`];
                        // The correct answer should match the option index
                        return parseInt(userAnswer) === optionIndex;
                    });
                }
            } else if (question.questionType === 'multipleChoice') {
                // For multiple choice questions
                if (Array.isArray(answer)) {
                    // Multiple selections
                    isAnswered = answer.length > 0;
                    if (isAnswered && Array.isArray(question.correctAnswers)) {
                        const selectedAnswers = answer.map(a => parseInt(a, 10)).sort((a, b) => a - b);
                        const correctAnswers = [...question.correctAnswers].sort((a, b) => a - b);
                        isCorrect = JSON.stringify(selectedAnswers) === JSON.stringify(correctAnswers);
                    }
                } else {
                    // Single selection
                    isAnswered = answer !== undefined && answer !== null && answer !== '';
                    if (isAnswered && Array.isArray(question.correctAnswers)) {
                        const selectedAnswer = parseInt(answer, 10);
                        isCorrect = question.correctAnswers.includes(selectedAnswer);
                    }
                }
            } else if (question.questionType === 'singleAnswer') {
                // For single answer questions
                const answerNum = Number(answer);
                isAnswered = !isNaN(answerNum) || answer === 0;
                
                if (isAnswered) {
                    const correctNum = Number(question.correctAnswer);
                    isCorrect = answerNum === correctNum;
                }
            } else {
                // For other question types (shortAnswer, longAnswer)
                isAnswered = answer !== undefined && answer !== null && 
                           (typeof answer === 'string' ? answer.trim() !== '' : answer !== '');
                
                if (isAnswered) {
                    isCorrect = true; // Give full marks for text answers
                }
            }

            // Track unanswered required questions
            if (question.required && !isAnswered) {
                unansweredQuestions.push(i + 1);
            }

            // Add to score if correct
            if (isCorrect) {
                score += question.marks;
            }
        }

        // Check if there are unanswered required questions
        if (unansweredQuestions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`
            });
        }

        // Calculate percentage
        const percentage = (score / totalMarks) * 100;
        const passed = percentage >= 60;

        // Update course progress
        if (!courseProgress) {
            courseProgress = await CourseProgress.create({
                userId,
                courseID: courseId,
                completedVideos: [],
                completedQuizzes: passed ? [subsectionId] : [],
                passedQuizzes: passed ? [subsectionId] : [],
                quizResults: [{
                    quiz: quiz._id,
                    subSection: subsectionId,
                    score,
                    totalMarks,
                    percentage,
                    passed,
                    attempts: 1,
                    completedAt: new Date()
                }]
            });
        } else {
            // Get existing quiz result to update attempts
            const existingQuizResult = courseProgress.quizResults.find(
                result => result.quiz.toString() === quiz._id.toString()
            );
            const attempts = existingQuizResult ? existingQuizResult.attempts + 1 : 1;

            // Update completedQuizzes and passedQuizzes arrays
            if (passed) {
                if (!courseProgress.completedQuizzes.includes(subsectionId)) {
                    courseProgress.completedQuizzes.push(subsectionId);
                }
                if (!courseProgress.passedQuizzes.includes(subsectionId)) {
                    courseProgress.passedQuizzes.push(subsectionId);
                }
            }
            
            // Remove any existing result for this quiz and add new one
            courseProgress.quizResults = courseProgress.quizResults.filter(
                result => result.quiz.toString() !== quiz._id.toString()
            );
            
            courseProgress.quizResults.push({
                quiz: quiz._id,
                subSection: subsectionId,
                score,
                totalMarks,
                percentage,
                passed,
                attempts,
                completedAt: new Date()
            });
            
            await courseProgress.save();
        }

        return res.status(200).json({
            success: true,
            message: passed ? 'Quiz passed successfully!' : 'Quiz submitted successfully, but did not meet passing score.',
            data: {
                score,
                totalMarks,
                percentage: percentage.toFixed(1),
                passed,
                requiredPercentage: 60
            }
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting quiz',
            error: error.message
        });
    }
};

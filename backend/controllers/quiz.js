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
            .select('_id title description createdAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: quizzes
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

        // Check if all previous quizzes are completed
        for (const subsection of subsections) {
            if (subsection._id === sectionId) {
                break;
            }
            
            if (!courseProgress.completedQuizzes.includes(subsection._id)) {
                return res.status(200).json({
                    success: true,
                    canAccess: false,
                    message: 'Complete previous quizzes first'
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

        // Validate required questions and calculate score
        let score = 0;
        let totalMarks = 0;

        for (let i = 0; i < quiz.questions.length; i++) {
            const question = quiz.questions[i];
            const questionId = question._id.toString();
            
            totalMarks += question.marks;

            // Check if question is answered based on question type
            let isAnswered = false;
            let isCorrect = false;

            if (question.questionType === 'matchTheFollowing') {
                // For match the following, check if all pairs are answered
                const hasAllMatches = question.options.every((_, optionIndex) => 
                    answers[`${questionId}_${optionIndex}`] !== undefined && 
                    answers[`${questionId}_${optionIndex}`] !== ''
                );
                isAnswered = hasAllMatches;
                // For now, give full marks if all matches are provided
                // In a real scenario, you'd validate correct matches
                if (isAnswered) {
                    isCorrect = true;
                }
            } else if (question.questionType === 'multipleChoice') {
                // For multiple choice questions
                const answer = answers[questionId];
                isAnswered = Array.isArray(answer) && answer.length > 0;
                
                if (isAnswered && question.correctAnswers && question.correctAnswers.length > 0) {
                    // Check if selected answers match correct answers
                    const selectedIndices = answer.sort();
                    const correctIndices = question.correctAnswers.sort();
                    isCorrect = selectedIndices.length === correctIndices.length && 
                               selectedIndices.every((val, index) => val === correctIndices[index]);
                }
            } else if (question.questionType === 'singleAnswer') {
                // For single answer questions
                const answer = answers[questionId];
                isAnswered = answer !== undefined && answer !== null;
                
                if (isAnswered && question.correctAnswer !== undefined && question.correctAnswer !== null) {
                    // Check if selected answer matches correct answer
                    isCorrect = parseInt(answer) === question.correctAnswer;
                }
            } else {
                // For other question types (shortAnswer, longAnswer)
                const answer = answers[questionId];
                isAnswered = answer !== undefined && answer !== null && 
                           (typeof answer === 'string' ? answer.trim() !== '' : true);
                
                // For text answers, give full marks (manual grading can be implemented later)
                if (isAnswered) {
                    isCorrect = true;
                }
            }

            // Validate required questions
            if (question.required && !isAnswered) {
                return res.status(400).json({
                    success: false,
                    message: `Answer required for question ${i + 1}`
                });
            }

            // Add to score if correct
            if (isCorrect) {
                score += question.marks;
            }
        }

        // Update course progress
        let courseProgress = await CourseProgress.findOne({ userId, courseId });
        if (!courseProgress) {
            courseProgress = await CourseProgress.create({
                userId,
                courseId,
                completedVideos: [],
                completedQuizzes: [subsectionId],
                quizResults: [{
                    quiz: quiz._id,
                    score,
                    totalMarks,
                    submittedAt: new Date()
                }]
            });
        } else {
            if (!courseProgress.completedQuizzes.includes(subsectionId)) {
                courseProgress.completedQuizzes.push(subsectionId);
            }
            
            // Remove any existing result for this quiz and add new one
            courseProgress.quizResults = courseProgress.quizResults.filter(
                result => result.quiz.toString() !== quiz._id.toString()
            );
            
            courseProgress.quizResults.push({
                quiz: quiz._id,
                score,
                totalMarks,
                submittedAt: new Date()
            });
            
            await courseProgress.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully',
            data: {
                score,
                totalMarks,
                percentage: ((score / totalMarks) * 100).toFixed(1)
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

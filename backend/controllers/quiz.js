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
        const unansweredQuestions = [];

        console.log('Quiz questions:', quiz.questions.length);
        console.log('Received answers:', JSON.stringify(answers, null, 2));

        // Debug: Log the entire quiz structure
        console.log('Quiz structure:', JSON.stringify(quiz.questions.map(q => ({
            id: q._id,
            type: q.questionType,
            correctAnswer: q.correctAnswer,
            correctAnswers: q.correctAnswers,
            options: q.options
        })), null, 2));

        for (let i = 0; i < quiz.questions.length; i++) {
            const question = quiz.questions[i];
            const questionId = question._id.toString();
            
            totalMarks += question.marks;

            // Check if question is answered based on question type
            let isAnswered = false;
            let isCorrect = false;

            console.log(`Checking question ${i + 1} (ID: ${questionId}), type: ${question.questionType}`);
            console.log(`Question correct answer:`, question.correctAnswer);
            console.log(`Question correct answers:`, question.correctAnswers);

            // Check if answer exists for this question
            const answer = answers[questionId];
            console.log(`Answer for question ${questionId}:`, answer, typeof answer);

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
                    
                    console.log(`Match the following question ${questionId}: all correct = ${isCorrect}`);
                    
                    // Log individual matches for debugging
                    question.options.forEach((_, optionIndex) => {
                        const userAnswer = answers[`${questionId}_${optionIndex}`];
                        console.log(`  Match ${optionIndex}: user=${userAnswer}, correct=${optionIndex}, match=${parseInt(userAnswer) === optionIndex}`);
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
                    console.log(`Answer comparison: ${answerNum} === ${correctNum} = ${isCorrect}`);
                }
            } else {
                // For other question types (shortAnswer, longAnswer)
                isAnswered = answer !== undefined && answer !== null && 
                           (typeof answer === 'string' ? answer.trim() !== '' : answer !== '');
                
                if (isAnswered) {
                    isCorrect = true; // Give full marks for text answers
                }
            }

            console.log(`Question ${i + 1}: answered = ${isAnswered}, correct = ${isCorrect}, answer = ${answer}`);

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
            console.log('Unanswered questions:', unansweredQuestions);
            return res.status(400).json({
                success: false,
                message: `Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`
            });
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

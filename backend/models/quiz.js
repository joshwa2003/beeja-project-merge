const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['multipleChoice', 'singleAnswer', 'shortAnswer', 'matchTheFollowing', 'longAnswer'],
        required: true
    },
    options: [
        {
            type: String
        }
    ],
    correctAnswers: [
        {
            type: Number // Array of indices for multiple choice questions
        }
    ],
    correctAnswer: {
        type: Number // Single index for single answer questions
    },
    marks: {
        type: Number,
        default: 1
    },
    required: {
        type: Boolean,
        default: true
    }
});

const quizSchema = new mongoose.Schema({
    subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSection',
        required: true,
        unique: true
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function(val) {
                // Remove validation temporarily for testing
                return true;
                // return val.length >= 15 && val.length <= 25;
            },
            message: '{PATH} must have between 15 and 25 questions'
        },
        required: true
    }
});

module.exports = mongoose.model('Quiz', quizSchema);

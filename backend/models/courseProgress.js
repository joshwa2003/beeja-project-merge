const mongoose = require("mongoose")

const courseProgressSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        },
    ],
    completedQuizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        }
    ],
    quizResults: [
        {
            quiz: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Quiz"
            },
            score: Number,
            totalMarks: Number,
            completedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
})



module.exports = mongoose.model("CourseProgress", courseProgressSchema)


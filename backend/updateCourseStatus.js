const mongoose = require('mongoose');
const Course = require('./models/course');

// MongoDB connection
const MONGO_URI = "mongodb://localhost:27017/learnhub";

const updateCourseStatus = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Update all courses that don't have a status field or have null/undefined status
        const result = await Course.updateMany(
            { $or: [{ status: { $exists: false } }, { status: null }, { status: undefined }] },
            { $set: { status: "Published" } }
        );

        console.log(`Updated ${result.modifiedCount} courses with status "Published"`);

        // Verify the update
        const coursesWithStatus = await Course.find({ status: "Published" }).countDocuments();
        const totalCourses = await Course.countDocuments();
        
        console.log(`Total courses: ${totalCourses}`);
        console.log(`Courses with "Published" status: ${coursesWithStatus}`);

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");

    } catch (error) {
        console.error("Error updating course status:", error);
        process.exit(1);
    }
};

// Run the update function
updateCourseStatus();

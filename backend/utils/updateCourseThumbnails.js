const mongoose = require('mongoose');
const Course = require('../models/course');

const MONGO_URI = "mongodb://127.0.0.1:27017/learnhub";

// Map of course names to new thumbnail URLs
const newThumbnailUrl = "https://blog.ipleaders.in/wp-content/uploads/2021/05/online-course-blog-header.jpg";

const updateThumbnails = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses`);

        for (const course of courses) {
            course.thumbnail = newThumbnailUrl;
            await course.save();
            console.log(`Updated thumbnail for course: ${course.courseName}`);
        }

        await mongoose.connection.close();
        console.log("Database connection closed. Thumbnails updated successfully.");
    } catch (error) {
        console.error("Error updating thumbnails:", error);
        process.exit(1);
    }
};

updateThumbnails();

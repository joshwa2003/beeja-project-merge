const mongoose = require('mongoose');
const Course = require('./models/course');

// MongoDB connection
const MONGO_URI = "mongodb://localhost:27017/learnhub";

const checkCourseStatus = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Get all courses and check their status
        const allCourses = await Course.find({}).select('courseName status').limit(10);
        
        console.log("Sample courses and their status:");
        allCourses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseName} - Status: "${course.status}" (Type: ${typeof course.status})`);
        });

        // Count courses by status
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: "Published" });
        const draftCourses = await Course.countDocuments({ status: "Draft" });
        const nullStatusCourses = await Course.countDocuments({ status: { $in: [null, undefined] } });
        const noStatusField = await Course.countDocuments({ status: { $exists: false } });

        console.log("\n=== Course Status Summary ===");
        console.log(`Total courses: ${totalCourses}`);
        console.log(`Published courses: ${publishedCourses}`);
        console.log(`Draft courses: ${draftCourses}`);
        console.log(`Null/undefined status: ${nullStatusCourses}`);
        console.log(`No status field: ${noStatusField}`);

        // Update all courses without proper status to "Published"
        const updateResult = await Course.updateMany(
            { $or: [
                { status: { $exists: false } },
                { status: null },
                { status: undefined },
                { status: "" }
            ]},
            { $set: { status: "Published" } }
        );

        console.log(`\nUpdated ${updateResult.modifiedCount} courses to "Published" status`);

        // Verify the update
        const publishedAfterUpdate = await Course.countDocuments({ status: "Published" });
        console.log(`Published courses after update: ${publishedAfterUpdate}`);

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");

    } catch (error) {
        console.error("Error checking course status:", error);
        process.exit(1);
    }
};

// Run the check function
checkCourseStatus();

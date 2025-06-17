const mongoose = require('mongoose');
const Category = require('../models/category');
const Course = require('../models/course');
const User = require('../models/user');
const Profile = require('../models/profile');

// MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/learnhub";

const clearDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear all collections
        await Category.deleteMany({});
        console.log("Cleared all categories");

        await Course.deleteMany({});
        console.log("Cleared all courses");

        await User.deleteMany({});
        console.log("Cleared all users");

        await Profile.deleteMany({});
        console.log("Cleared all profiles");

        console.log("All data has been cleared from the database");

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");

    } catch (error) {
        console.error("Error clearing database:", error);
        process.exit(1);
    }
};

// Run the clear function
clearDatabase();

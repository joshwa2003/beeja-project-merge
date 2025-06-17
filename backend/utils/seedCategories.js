const mongoose = require('mongoose');
const Category = require('../models/category');

// MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/learnhub";

const categories = [
    {
        name: "Web Development",
        description: "Learn web development from scratch to advanced level"
    },
    {
        name: "Mobile Development",
        description: "Master mobile app development for iOS and Android"
    },
    {
        name: "Data Science",
        description: "Explore data science, machine learning, and AI"
    },
    {
        name: "Cloud Computing",
        description: "Learn cloud platforms like AWS, Azure, and GCP"
    }
];

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing categories
        await Category.deleteMany({});
        console.log("Cleared existing categories");

        // Insert new categories
        const createdCategories = await Category.insertMany(categories);
        console.log("Added categories:", createdCategories);

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");

    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

// Run the seed function
seedCategories();

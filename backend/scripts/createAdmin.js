const mongoose = require('mongoose');
const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/learnhub';

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: "System Administrator",
      contactNumber: null
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      accountType: 'Admin',
      additionalDetails: profileDetails._id,
      approved: true,
      active: true,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=Admin User`
    });

    console.log('Admin user created successfully:', {
      email: adminUser.email,
      accountType: adminUser.accountType
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();

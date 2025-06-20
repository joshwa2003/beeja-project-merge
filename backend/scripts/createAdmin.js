const mongoose = require('mongoose');
const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');

require('dotenv').config();
// MongoDB container connection
const MONGO_URI = process.env.MONGODB_URL;

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'hariharish2604@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update to admin if not already
      if (existingAdmin.accountType !== 'Admin') {
        await User.findByIdAndUpdate(existingAdmin._id, { 
          accountType: 'Admin',
          active: true,
          approved: true 
        });
        console.log('Updated existing user to Admin');
      }
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
      firstName: 'Harish',
      lastName: 'Admin',
      email: 'hariharish2604@gmail.com',
      password: hashedPassword,
      accountType: 'Admin',
      additionalDetails: profileDetails._id,
      approved: true,
      active: true,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=Harish Admin`
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

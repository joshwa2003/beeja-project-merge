const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Profile = require('./models/profile');

mongoose.connect('mongodb://localhost:27017/studynotion', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    // Create user profile
    const profile = new Profile({
      gender: 'Male',
      dateOfBirth: '2000-01-01',
      about: 'Test student profile',
      contactNumber: '1234567890',
    });
    await profile.save();
    console.log('Profile created:', profile._id);

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create user
    const user = new User({
      firstName: 'Test',
      lastName: 'Student',
      email: 'student2@example.com',
      password: hashedPassword,
      accountType: 'Student',
      active: true,
      approved: true,
      additionalDetails: profile._id,
      image: 'https://api.dicebear.com/5.x/initials/svg?seed=TS',
    });

    await user.save();
    console.log('User created:', user._id);

    // Update the user ID we're using for notifications
    console.log('Use this ID for notifications:', user._id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();

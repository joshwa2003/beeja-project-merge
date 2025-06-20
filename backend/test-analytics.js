const mongoose = require('mongoose');
require('dotenv').config();

async function testAnalytics() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');
    
    const Course = require('./models/course');
    
    // Check recent courses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('\nFetching courses created after:', thirtyDaysAgo);
    
    const recentCourses = await Course.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
    .populate('instructor', 'firstName lastName')
    .populate('category', 'name')
    .select('courseName createdAt instructor category status price courseType')
    .sort({ createdAt: -1 })
    .limit(10);
    
    console.log('\nFound', recentCourses.length, 'recent courses:');
    recentCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.courseName}`);
      console.log(`   Created: ${course.createdAt}`);
      console.log(`   Instructor: ${course.instructor ? course.instructor.firstName + ' ' + course.instructor.lastName : 'Unknown'}`);
      console.log(`   Category: ${course.category ? course.category.name : 'Unknown'}`);
      console.log(`   Status: ${course.status}`);
      console.log('');
    });
    
    // Check all courses to see total count
    const allCourses = await Course.countDocuments();
    console.log('Total courses in database:', allCourses);
    
    // Get the most recent 5 courses regardless of date
    const latestCourses = await Course.find({})
      .populate('instructor', 'firstName lastName')
      .populate('category', 'name')
      .select('courseName createdAt instructor category status price courseType')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\nMost recent 5 courses (regardless of date):');
    latestCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.courseName}`);
      console.log(`   Created: ${course.createdAt}`);
      console.log(`   Instructor: ${course.instructor ? course.instructor.firstName + ' ' + course.instructor.lastName : 'Unknown'}`);
      console.log(`   Category: ${course.category ? course.category.name : 'Unknown'}`);
      console.log(`   Status: ${course.status}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAnalytics();

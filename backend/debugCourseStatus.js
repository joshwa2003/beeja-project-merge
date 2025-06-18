const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/course');

async function debugCourseStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all courses and check their status values
    const courses = await Course.find({}).select('courseName status').limit(10);
    
    console.log('\n=== Course Status Debug ===');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.courseName}`);
      console.log(`   Status: "${course.status}"`);
      console.log(`   Status type: ${typeof course.status}`);
      console.log(`   Status length: ${course.status ? course.status.length : 'null/undefined'}`);
      console.log(`   Equals 'Published': ${course.status === 'Published'}`);
      console.log(`   Equals "Published": ${course.status === "Published"}`);
      console.log(`   Trimmed equals 'Published': ${course.status && course.status.trim() === 'Published'}`);
      console.log('   ---');
    });

    // Check unique status values
    const uniqueStatuses = await Course.distinct('status');
    console.log('\n=== Unique Status Values ===');
    uniqueStatuses.forEach(status => {
      console.log(`"${status}" (type: ${typeof status}, length: ${status ? status.length : 'null/undefined'})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugCourseStatus();

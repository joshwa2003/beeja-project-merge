const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/studynotion', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function listUsers() {
  try {
    const users = await User.find({}).select('email firstName lastName accountType');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.accountType}): ${user.firstName} ${user.lastName}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

listUsers();

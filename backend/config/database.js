const mongoose = require('mongoose');

// MongoDB container connection
const MONGO_URI = process.env.MONGODB_URL;

exports.connectDB = async () => {
  let retries = 5;
  
  const connectWithRetry = async () => {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      };

      console.log('Attempting to connect to database...');
      await mongoose.connect(MONGO_URI, options);
      console.log("Database connected successfully");

      // Create indexes for better performance
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ accountType: 1 });
      
    } catch (error) {
      console.error("Error while connecting to Database:", {
        message: error.message,
        code: error.code,
        uri: MONGO_URI
      });
      
      if (retries > 0) {
        retries--;
        console.log(`Retrying connection... (${retries} attempts remaining)`);
        // Wait for 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectWithRetry();
      } else {
        console.log("Max retries reached. Exiting...");
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

const mongoose = require('mongoose');

// Contact Message Schema
const contactMessageSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  countrycode: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/beeja-academy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Dummy messages data
const dummyMessages = [
  {
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    phoneNo: "1234567890",
    countrycode: "+1",
    message: "I'm interested in your web development course. Can you provide more details?",
    status: "unread",
    createdAt: new Date('2025-01-20')
  },
  {
    firstname: "Jane",
    lastname: "Smith",
    email: "jane.smith@gmail.com",
    phoneNo: "9876543210",
    countrycode: "+1",
    message: "Hello, I would like to know about the pricing for your courses.",
    status: "read",
    createdAt: new Date('2025-01-19')
  },
  {
    firstname: "Mike",
    lastname: "Johnson",
    email: "mike.johnson@yahoo.com",
    phoneNo: "5555555555",
    countrycode: "+1",
    message: "Can you help me with JavaScript fundamentals?",
    status: "unread",
    createdAt: new Date('2025-01-18')
  },
  {
    firstname: "Sarah",
    lastname: "Wilson",
    email: "sarah.wilson@hotmail.com",
    phoneNo: "7777777777",
    countrycode: "+1",
    message: "I need assistance with React development. Please contact me.",
    status: "read",
    createdAt: new Date('2025-01-17')
  },
  {
    firstname: "David",
    lastname: "Brown",
    email: "david.brown@test.com",
    phoneNo: "8888888888",
    countrycode: "+1",
    message: "Looking for advanced Node.js training. What do you offer?",
    status: "unread",
    createdAt: new Date('2025-01-16')
  },
  {
    firstname: "Emily",
    lastname: "Davis",
    email: "emily.davis@example.org",
    phoneNo: "9999999999",
    countrycode: "+1",
    message: "I want to learn about database design and MongoDB.",
    status: "read",
    createdAt: new Date('2025-01-15')
  },
  {
    firstname: "Alex",
    lastname: "Miller",
    email: "alex.miller@company.com",
    phoneNo: "1111111111",
    countrycode: "+1",
    message: "Do you provide corporate training for teams?",
    status: "unread",
    createdAt: new Date('2025-01-14')
  },
  {
    firstname: "Lisa",
    lastname: "Garcia",
    email: "lisa.garcia@university.edu",
    phoneNo: "2222222222",
    countrycode: "+1",
    message: "Student discount available for your courses?",
    status: "read",
    createdAt: new Date('2025-01-13')
  },
  {
    firstname: "Tom",
    lastname: "Anderson",
    email: "tom.anderson@startup.io",
    phoneNo: "3333333333",
    countrycode: "+1",
    message: "Interested in full-stack development bootcamp. When does it start?",
    status: "unread",
    createdAt: new Date('2025-01-12')
  },
  {
    firstname: "Rachel",
    lastname: "Taylor",
    email: "rachel.taylor@freelance.net",
    phoneNo: "4444444444",
    countrycode: "+1",
    message: "Can you help me transition from design to development?",
    status: "read",
    createdAt: new Date('2025-01-11')
  }
];

async function insertDummyMessages() {
  try {
    console.log('Connecting to database...');
    
    // Clear existing messages (optional)
    await ContactMessage.deleteMany({});
    console.log('Cleared existing messages');
    
    // Insert dummy messages
    const result = await ContactMessage.insertMany(dummyMessages);
    console.log(`Successfully inserted ${result.length} dummy messages`);
    
    // Display summary
    const totalMessages = await ContactMessage.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ status: "unread" });
    const readMessages = await ContactMessage.countDocuments({ status: "read" });
    
    console.log('\n=== MESSAGE SUMMARY ===');
    console.log(`Total Messages: ${totalMessages}`);
    console.log(`Unread Messages: ${unreadMessages}`);
    console.log(`Read Messages: ${readMessages}`);
    
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error inserting dummy messages:', error);
    mongoose.connection.close();
  }
}

insertDummyMessages();

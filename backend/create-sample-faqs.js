require('dotenv').config();
const mongoose = require('mongoose');
const FAQ = require('./models/faq');
const User = require('./models/user');

const { connectDB } = require('./config/database');

async function createSampleFaqs() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Find an admin user to associate with FAQs
        const adminUser = await User.findOne({ accountType: 'Admin' });
        if (!adminUser) {
            console.log('No admin user found. Creating sample admin...');
            const sampleAdmin = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'hashedpassword',
                accountType: 'Admin',
                approved: true,
                active: true
            });
            console.log('Sample admin created:', sampleAdmin.email);
        }

        const userId = adminUser ? adminUser._id : (await User.findOne({ accountType: 'Admin' }))._id;

        // Create sample FAQs
        const sampleFaqs = [
            {
                question: "How do I enroll in a course?",
                answer: "To enroll in a course, simply browse our course catalog, select the course you're interested in, and click the 'Enroll Now' button. You'll be guided through the payment process if it's a paid course.",
                userId: userId,
                status: 'answered',
                isPublished: true,
                answeredAt: new Date()
            },
            {
                question: "Can I get a refund if I'm not satisfied with a course?",
                answer: "Yes, we offer a 7-day money-back guarantee for all paid courses. If you're not satisfied, contact our support team within 7 days of purchase for a full refund.",
                userId: userId,
                status: 'answered',
                isPublished: true,
                answeredAt: new Date()
            },
            {
                question: "How long do I have access to a course after enrollment?",
                answer: "Once you enroll in a course, you have lifetime access to all course materials, including any future updates to the content.",
                userId: userId,
                status: 'answered',
                isPublished: true,
                answeredAt: new Date()
            },
            {
                question: "Do you offer certificates upon course completion?",
                answer: "Yes, we provide certificates of completion for all our courses. You can download your certificate from your dashboard once you've completed all course requirements.",
                userId: userId,
                status: 'answered',
                isPublished: false, // This one is not published
                answeredAt: new Date()
            },
            {
                question: "What payment methods do you accept?",
                userId: userId,
                status: 'pending', // This one is not answered yet
                isPublished: false
            }
        ];

        // Clear existing FAQs
        await FAQ.deleteMany({});
        console.log('Cleared existing FAQs');

        // Create new FAQs
        const createdFaqs = await FAQ.insertMany(sampleFaqs);
        console.log(`Created ${createdFaqs.length} sample FAQs`);

        console.log('\nSample FAQs created:');
        createdFaqs.forEach((faq, index) => {
            console.log(`${index + 1}. ${faq.question} (Status: ${faq.status}, Published: ${faq.isPublished})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating sample FAQs:', error);
        process.exit(1);
    }
}

createSampleFaqs();

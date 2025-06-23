require('dotenv').config(); 
const express = require('express')
const app = express();

// packages
// const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const adminRoutes = require('./routes/admin');
const courseAccessRoutes = require('./routes/courseAccess');
const quizRoutes = require('./routes/quiz');
const notificationRoutes = require('./routes/notification');
const contactMessageRoutes = require('./routes/contactMessage');
const featuredCoursesRoutes = require('./routes/featuredCourses');
const faqRoutes = require('./routes/faq.js');

// middleware 
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Frontend URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware with increased limits
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Increase timeout for large uploads
app.use((req, res, next) => {
    res.setTimeout(300000); // 5 minutes timeout
    next();
});

// Log all incoming requests (after body parsing)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    next();
});

// mount routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/course-access', courseAccessRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/contact', contactMessageRoutes);
app.use('/api/v1/featured-courses', featuredCoursesRoutes);
// FAQ Routes
app.use('/api/v1/faqs', faqRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send(`<div>
        This is Default Route  
        <p>Everything is OK</p>
    </div>`);
});

// Error handling middleware for Multer errors and others
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err);
    
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Maximum limit is 500MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    // Only handle errors that haven't been handled by route controllers
    if (!res.headersSent) {
        console.error('Unhandled error:', err);
        res.status(500).json({ 
            error: 'An internal server error occurred.',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// connections
connectDB();
cloudinaryConnect();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`);
});

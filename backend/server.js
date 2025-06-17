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

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle empty DELETE request bodies
app.use((req, res, next) => {
    if (req.method === 'DELETE' && (!req.headers['content-length'] || req.headers['content-length'] === '0')) {
        req.body = {};
    }
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

// Removed express-fileupload middleware to avoid conflict with multer
// app.use(
//     fileUpload({
//         useTempFiles: true,
//         tempFileDir: '/tmp'
//     })
// );

// mount routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/course-access', courseAccessRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send(`<div>
        This is Default Route  
        <p>Everything is OK</p>
    </div>`);
});

// connections
connectDB();
cloudinaryConnect();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`);
});

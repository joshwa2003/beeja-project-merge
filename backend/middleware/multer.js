const multer = require('multer');

// Configure disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/uploads')  // Use relative path
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '..', 'tmp', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept video files and images
        if (!file.originalname.match(/\.(mp4|mov|avi|wmv|mkv|flv|webm|jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only video and image files are allowed!'), false);
        }
        cb(null, true);
    }
});

module.exports = { upload };

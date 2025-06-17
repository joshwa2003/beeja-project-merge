const express = require('express');
const router = express.Router();

const {
    requestCourseAccess,
    getUserAccessRequests,
    getAllAccessRequests,
    handleAccessRequest,
    getFreeCourses
} = require('../controllers/courseAccess');

const { auth, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/free-courses', getFreeCourses);

// Student routes
router.post('/request-access', auth, requestCourseAccess);
router.get('/my-requests', auth, getUserAccessRequests);

// Admin routes
router.get('/requests', auth, isAdmin, getAllAccessRequests);
router.put('/requests/:requestId', auth, isAdmin, handleAccessRequest);

module.exports = router;

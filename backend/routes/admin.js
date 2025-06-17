const express = require('express');
const router = express.Router();

// Import controllers
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllCourses,
    createCourseAsAdmin,
    approveCourse,
    deleteCourse,
    getAnalytics,
    toggleUserStatus,
    toggleCourseVisibility,
    setCourseType,
    getAllInstructors
} = require('../controllers/admin');

// Import middleware
const { auth, isAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/multer');

// ================ USER MANAGEMENT ROUTES ================
router.get('/users', auth, isAdmin, getAllUsers);
router.post('/users', auth, isAdmin, createUser);
router.put('/users/:userId', auth, isAdmin, updateUser);
router.delete('/users/:userId', auth, isAdmin, deleteUser);
router.put('/users/:userId/toggle-status', auth, isAdmin, toggleUserStatus);

// ================ COURSE MANAGEMENT ROUTES ================
router.get('/courses', auth, isAdmin, getAllCourses);
router.post('/courses/create', auth, isAdmin, upload.fields([{ name: "thumbnailImage", maxCount: 1 }]), createCourseAsAdmin);
router.put('/courses/:courseId/approve', auth, isAdmin, approveCourse);
router.delete('/courses/:courseId', auth, isAdmin, deleteCourse);
router.put('/courses/:courseId/toggle-visibility', auth, isAdmin, toggleCourseVisibility);
router.put('/courses/:courseId/set-type', auth, isAdmin, setCourseType);

// ================ INSTRUCTOR ROUTES ================
router.get('/instructors', auth, isAdmin, getAllInstructors);

// ================ ANALYTICS ROUTES ================
router.get('/analytics', auth, isAdmin, getAnalytics);

module.exports = router;

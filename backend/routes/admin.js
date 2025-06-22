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
const { createCoupon, validateCoupon, applyCoupon, getAllCoupons, getFrontendCoupons, toggleCouponStatus } = require('../controllers/coupon');

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

// ================ COUPON ROUTES ================
router.get('/coupons', auth, isAdmin, getAllCoupons);
router.get('/coupons/frontend', getFrontendCoupons); // Public endpoint for frontend coupons
router.post('/coupons/create', auth, isAdmin, createCoupon);
router.post('/coupons/validate', auth, validateCoupon);
router.post('/coupons/apply', auth, applyCoupon);
router.patch('/coupons/:couponId/toggle', auth, isAdmin, toggleCouponStatus);

module.exports = router;

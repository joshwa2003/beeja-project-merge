const User = require('../models/user');
const Course = require('../models/course');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// [Previous code remains unchanged until getAnalytics]

exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const studentCount = await User.countDocuments({ accountType: 'Student' });
        const instructorCount = await User.countDocuments({ accountType: 'Instructor' });
        const adminCount = await User.countDocuments({ accountType: 'Admin' });

        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: 'Published' });
        const draftCourses = await Course.countDocuments({ status: 'Draft' });
        const freeCourses = await Course.countDocuments({ courseType: 'Free' });
        const paidCourses = await Course.countDocuments({ courseType: 'Paid' });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get pending access requests count
        const CourseAccessRequest = require('../models/courseAccessRequest');
        const pendingRequests = await CourseAccessRequest.countDocuments({ status: 'Pending' });

        // Get recent courses (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCourses = await Course.find({
            createdAt: { $gte: sevenDaysAgo }
        })
        .populate('instructor', 'firstName lastName')
        .select('courseName instructor createdAt status')
        .sort({ createdAt: -1 })
        .limit(10);

        // Format recent courses data
        const formattedRecentCourses = recentCourses.map(course => ({
            id: course._id,
            title: course.courseName,
            instructor: course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown',
            createdAt: course.createdAt,
            status: course.status
        }));

        // Get recent logins (last 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const recentUsers = await User.find({
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .select('firstName lastName email accountType createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

        // Format recent logins data
        const formattedRecentLogins = recentUsers.map(user => ({
            id: user._id,
            user: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.accountType,
            loginTime: user.createdAt
        }));

        // Calculate revenue based on payments
        const Payment = require('../models/payment');
        
        const currentDate = new Date();
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // Get all completed payments
        const completedPayments = await Payment.find({ 
            status: 'completed' 
        });

        // Calculate revenue
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let previousMonthRevenue = 0;
        let yearlyRevenue = 0;

        completedPayments.forEach(payment => {
            const amount = payment.amount || 0;
            const purchaseDate = payment.purchaseDate;

            totalRevenue += amount;

            if (purchaseDate >= currentMonth) {
                monthlyRevenue += amount;
            }

            if (purchaseDate >= previousMonth && purchaseDate <= previousMonthEnd) {
                previousMonthRevenue += amount;
            }

            if (purchaseDate >= twelveMonthsAgo) {
                yearlyRevenue += amount;
            }
        });

        // Calculate growth percentage
        let growthPercentage = 0;
        if (previousMonthRevenue > 0) {
            growthPercentage = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        } else if (monthlyRevenue > 0) {
            growthPercentage = 100;
        }

        // Round growth percentage to 2 decimal places
        growthPercentage = Math.round(growthPercentage * 100) / 100;

        return res.status(200).json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    students: studentCount,
                    instructors: instructorCount,
                    admins: adminCount,
                    recentRegistrations
                },
                courses: {
                    total: totalCourses,
                    published: publishedCourses,
                    draft: draftCourses,
                    free: freeCourses,
                    paid: paidCourses
                },
                requests: {
                    pendingAccessRequests: pendingRequests
                },
                revenue: {
                    totalRevenue,
                    monthlyRevenue,
                    growthPercentage,
                    yearlyRevenue
                },
                recentCourses: formattedRecentCourses,
                recentLogins: formattedRecentLogins
            },
            message: 'Analytics data fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// [Rest of the code remains unchanged]

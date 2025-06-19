const User = require("../models/user");
const Course = require("../models/course");
const Payment = require("../models/payment");

exports.capturePayment = async (req, res) => {
    try {
        const { courseId, paymentId, orderId, signature } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!courseId || !paymentId || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment details"
            });
        }

        // Get course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Create payment record
        const payment = await Payment.create({
            user: userId,
            course: courseId,
            amount: course.price,
            paymentId: paymentId,
            orderId: orderId,
            signature: signature,
            status: 'completed',
            purchaseDate: new Date()
        });

        // Add course to user's enrolled courses
        await User.findByIdAndUpdate(userId, {
            $addToSet: { courses: courseId }
        });

        // Add user to course's enrolled students
        await Course.findByIdAndUpdate(courseId, {
            $addToSet: { studentsEnrolled: userId }
        });

        res.json({
            success: true,
            message: "Payment captured successfully",
            paymentId: payment._id
        });
    } catch (error) {
        console.error("Error in capturePayment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to capture payment"
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { courseId, paymentId, orderId, signature } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!courseId || !paymentId || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment details"
            });
        }

        // Get course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // For free courses, create a payment record with amount 0
        const paymentAmount = course.price || 0;
        const paymentMethod = paymentAmount === 0 ? 'free' : 'razorpay';

        // Create or update payment record
        const payment = await Payment.findOneAndUpdate(
            { user: userId, course: courseId, orderId: orderId },
            {
                user: userId,
                course: courseId,
                amount: paymentAmount,
                paymentId: paymentId,
                orderId: orderId,
                signature: signature,
                paymentMethod: paymentMethod,
                status: 'completed',
                purchaseDate: new Date()
            },
            { upsert: true, new: true }
        );

        // Add course to user's enrolled courses
        await User.findByIdAndUpdate(userId, {
            $addToSet: { courses: courseId }
        });

        // Add user to course's enrolled students
        await Course.findByIdAndUpdate(courseId, {
            $addToSet: { studentsEnrolled: userId }
        });

        res.json({
            success: true,
            message: "Payment verified successfully",
            paymentId: payment._id
        });
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        });
    }
};

exports.getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all completed payments for the user
        const payments = await Payment.find({ 
            user: userId,
            status: 'completed'
        })
        .populate({
            path: 'course',
            select: 'courseName description thumbnail'
        })
        .sort({ purchaseDate: -1 });

        // Transform payments data to include course details
        const purchaseHistory = payments.map(payment => ({
            _id: payment.course._id,
            courseName: payment.course.courseName,
            courseDescription: payment.course.description,
            thumbnail: payment.course.thumbnail,
            price: payment.amount,
            purchaseDate: payment.purchaseDate,
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            paymentMethod: payment.paymentMethod,
            status: payment.status
        }));

        return res.status(200).json({
            success: true,
            data: purchaseHistory
        });

    } catch (error) {
        console.error("Error fetching purchase history:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch purchase history",
            error: error.message
        });
    }
};

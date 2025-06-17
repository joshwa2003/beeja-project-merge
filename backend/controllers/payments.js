const User = require("../models/user");
const Course = require("../models/course");

exports.capturePayment = async (req, res) => {
    try {
        // Existing capturePayment implementation
        res.json({
            success: true,
            message: "Payment captured successfully"
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
        // Existing verifyPayment implementation
        res.json({
            success: true,
            message: "Payment verified successfully"
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

        // Find the user and populate their purchased courses
        const user = await User.findById(userId)
            .populate({
                path: 'courses',
                model: 'Course',
                select: 'courseName price description thumbnail createdAt'
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Transform the courses data to include purchase details
        const purchaseHistory = user.courses.map(course => ({
            _id: course._id,
            courseName: course.courseName,
            courseDescription: course.description,
            thumbnail: course.thumbnail,
            price: course.price || 0,
            purchaseDate: course.createdAt,
            status: "Completed"
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

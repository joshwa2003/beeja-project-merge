const User = require('../models/user')
const Course = require('../models/course')
const RatingAndReview = require('../models/ratingAndReview')
const mongoose = require('mongoose');

// ================ Create Rating ================
exports.createRating = async (req, res) => {
    try {
        console.log('CreateRating called with:', {
            body: req.body,
            user: req.user,
            headers: req.headers.authorization
        });

        // get data
        const { rating, review, courseId } = req.body;

        const userId = req.user?.id;

        // Check if user exists in request
        if (!req.user || !userId) {
            console.log('User not found in request');
            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });
        }

        // validation
        if (!rating || !review || !courseId) {
            console.log('Missing required fields:', { rating, review, courseId });
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate rating is between 1-5
        if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Get user details to check role
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Allow admin to review without enrollment
        if (userDetails.accountType !== 'Admin') {
            // For non-admin users, check if enrolled in course
            const courseDetails = await Course.findOne({ 
                _id: courseId,
                studentsEnrolled: { $in: [userId] }
            });

            if (!courseDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'You must be enrolled in the course to review it'
                });
            }
        }


        // check user already reviewd ?
        const alreadyReviewd = await RatingAndReview.findOne(
            { course:courseId, user:userId }
        );

        if (alreadyReviewd) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this course'
            });
        }

        // create entry in DB
        const ratingReview = await RatingAndReview.create({
            user:userId, course:courseId, rating, review
        });


        // link this rating to course 
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id
                }
            },
            { new: true })


        // console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success: true,
            data:ratingReview,
            message: "Rating and Review created Successfully",
        })
    }
    catch (error) {
        console.log('Error while creating rating and review');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating rating and review',
        })
    }
}




// ================ Get Average Rating ================
exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { 
                            $round: [{ $avg: "$rating" }, 1]
                        }
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}





// ================ Get All Rating And Reviews ================
exports.getAllRatingReview = async(req, res)=>{
    try{
        const allReviews = await RatingAndReview.find({})
        .sort({rating:'desc'})
        .populate({
            path:'user',
            select:'firstName lastName email image'
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            data:allReviews,
            message:"All reviews fetched successfully"
        });
    }
    catch(error){
        console.log('Error while fetching all ratings');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching all ratings',
        })
    }
}

const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Course = require('../models/course');
const Quiz = require('../models/quiz');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const { createNewContentNotification } = require('./notification');

// ================ Update SubSection ================
exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description, questions } = req.body;

        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'subSection ID is required to update'
            });
        }

        // find in DB
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // add data
        if (title) {
            subSection.title = title;
        }

        if (description) {
            subSection.description = description;
        }

        // upload video to cloudinary
        if (req.file) {
            const video = req.file;
            console.log('Uploading video file:', video.originalname);
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = uploadDetails.duration || 0;
            console.log('Video uploaded successfully:', uploadDetails.secure_url);
        }

        // Handle quiz attachment
        if (req.body.quiz !== undefined) {
            if (req.body.quiz === '' || req.body.quiz === null) {
                // Remove quiz reference
                subSection.quiz = null;
            } else {
                // Attach existing quiz
                const quizExists = await Quiz.findById(req.body.quiz);
                if (quizExists) {
                    subSection.quiz = req.body.quiz;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Quiz not found'
                    });
                }
            }
        }

        // save data to DB
        await subSection.save();

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.json({
            success: true,
            data: updatedSection,
            message: "Section updated successfully",
        });
    } catch (error) {
        console.error('Error while updating the section');
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while updating the section",
        });
    }
};


// ================ create SubSection ================
exports.createSubSection = async (req, res) => {
    try {
        // extract data
        const { title, description, sectionId, questions } = req.body;

        // extract video file
        const videoFile = req.file;
        console.log('req.file:', req.file);

        // validation
        if (!title || !description || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and sectionId are required'
            });
        }

        let videoUrl = '';
        let timeDuration = 0;

        if (videoFile) {
            try {
                console.log('Starting video upload to Cloudinary...');
                console.log('Video file details:', {
                    originalname: videoFile.originalname,
                    mimetype: videoFile.mimetype,
                    size: videoFile.size,
                    path: videoFile.path
                });
                
                // Check if FOLDER_NAME environment variable is set
                if (!process.env.FOLDER_NAME) {
                    console.log('Warning: FOLDER_NAME environment variable not set, using default');
                }
                
                // upload video to cloudinary with timeout
                const uploadPromise = uploadImageToCloudinary(videoFile, process.env.FOLDER_NAME || 'uploads');
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Upload timeout')), 300000) // 5 minutes timeout
                );
                
                const videoFileDetails = await Promise.race([uploadPromise, timeoutPromise]);
                console.log('Video uploaded successfully:', videoFileDetails.secure_url);
                
                videoUrl = videoFileDetails.secure_url;
                timeDuration = videoFileDetails.duration || 0;
            } catch (uploadError) {
                console.error('Video upload failed:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Video upload failed',
                    error: uploadError.message
                });
            }
        } else {
            console.log('No video file provided, creating subsection without video');
            videoUrl = null; // No video URL when no file is provided
        }

        // create entry in DB
        const SubSectionDetails = await SubSection.create({
            title, 
            timeDuration, 
            description, 
            videoUrl 
        });

        // Handle quiz attachment
        if (req.body.quiz) {
            const quizExists = await Quiz.findById(req.body.quiz);
            if (quizExists) {
                SubSectionDetails.quiz = req.body.quiz;
                await SubSectionDetails.save();
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }
        }

        // link subsection id to section
        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection");

        // Find the course that contains this section to notify students
        const course = await Course.findOne({
            courseContent: sectionId
        });

        if (course) {
            // Notify enrolled students about new content
            await createNewContentNotification(
                course._id,
                sectionId,
                SubSectionDetails._id
            );
        }

        // return response
        res.status(200).json({
            success: true,
            data: updatedSection,
            message: 'SubSection created successfully'
        });
    }
    catch (error) {
        console.log('Error while creating SubSection');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating SubSection',
            details: {
                stack: error.stack,
                name: error.name
            }
        });
    }
}






// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        // delete from DB
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate('subSection')

        // In frontned we have to take care - when subsection is deleted we are sending ,
        // only section data not full course details as we do in others 

        // success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,

            error: error.message,
            message: "An error occurred while deleting the SubSection",
        })
    }
}
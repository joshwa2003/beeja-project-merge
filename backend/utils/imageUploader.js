const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        const options = { folder };
        if (height) options.height = height;
        if (quality) options.quality = quality;

        // Set resource type and options for video uploads
        if (file.mimetype && file.mimetype.startsWith('video/')) {
            options.resource_type = 'video';
            options.chunk_size = 6000000; // 6MB chunks for better upload handling
            options.eager = [{ format: 'mp4' }];
            options.eager_async = false; // Wait for eager transformation
            options.video_metadata = true; // Request video metadata including duration
        } else {
            options.resource_type = 'auto';
            options.chunk_size = 6000000;
        }
        
        // Create a promise to handle the upload
        return new Promise((resolve, reject) => {
            // Create upload stream
            const uploadStream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // If file is in memory (Buffer)
            if (file.buffer) {
                uploadStream.end(file.buffer);
            } 
            // If file is on disk
            else if (file.path) {
                const fs = require('fs');
                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on('error', (error) => {
                        reject(error);
                    });
            } else {
                reject(new Error('Invalid file format'));
            }
        });
    }
    catch (error) {
        console.log("Error while uploading file to Cloudinary");
        console.log(error);
        throw error;
    }
}

// Function to delete a resource by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        // Extract public ID from Cloudinary URL
        let publicId = url;
        
        // If it's a full Cloudinary URL, extract the public ID
        if (url.includes('cloudinary.com')) {
            // Extract the public ID from the URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.extension
            const urlParts = url.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            
            if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
                // Get everything after 'upload/v1234567890/' or 'upload/'
                const pathAfterUpload = urlParts.slice(uploadIndex + 1);
                
                // Remove version if present (starts with 'v' followed by numbers)
                if (pathAfterUpload[0] && pathAfterUpload[0].match(/^v\d+$/)) {
                    pathAfterUpload.shift();
                }
                
                // Join the remaining parts and remove file extension
                publicId = pathAfterUpload.join('/').replace(/\.[^/.]+$/, '');
            }
        }

        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted resource with public ID: ${publicId}`);
        return result;
    } catch (error) {
        console.error(`Error deleting resource with URL ${url}:`, error);
        // Don't throw error to prevent account deletion from failing
        console.log('Continuing with account deletion despite image deletion failure');
        return null;
    }
};

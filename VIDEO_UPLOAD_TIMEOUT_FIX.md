# Video Upload Timeout Fix

## Problem
Video uploads to Cloudinary were timing out when uploading large files (89MB MP4 in this case), resulting in:
```
Video upload failed: { message: 'Request Timeout', http_code: 499, name: 'TimeoutError' }
```

## Root Causes
1. No timeout configuration in Cloudinary upload options
2. Large video files being uploaded without optimization
3. No retry mechanism for failed uploads
4. Basic upload options without video-specific optimizations

## Solutions Implemented

### 1. Enhanced Cloudinary Configuration (`backend/config/cloudinary.js`)
- Added timeout configuration (10 minutes)
- Added upload timeout settings
- Added chunk size configuration for large files

### 2. Improved Upload Utility (`backend/utils/imageUploader.js`)
- **Retry Mechanism**: Added automatic retry (up to 3 attempts) with 5-second delays
- **Chunked Upload**: Configured 6MB chunks for large files
- **Video Optimizations**: Added HLS streaming profile for video files
- **Progress Monitoring**: Added upload progress tracking
- **Enhanced Error Handling**: Better error messages and timeout detection

### 3. Enhanced Controller Logic (`backend/controllers/subSection.js`)
- **File Size Validation**: Added 500MB file size limit check
- **Timeout Management**: Added 10-minute timeout for upload process
- **Detailed Error Messages**: Specific error messages for different failure types
- **Better Logging**: Enhanced logging for debugging upload issues

## Key Features Added

### Retry Mechanism
```javascript
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
```

### Video-Specific Optimizations
```javascript
options.eager = [
    { streaming_profile: "full_hd", format: "m3u8" } // HLS streaming
];
options.eager_async = true;
```

### Enhanced Error Handling
- Timeout detection and specific error messages
- File size validation
- Detailed error information including file name, size, and error type

### Upload Configuration
- 10-minute timeout for large files
- 6MB chunk size for efficient upload
- Progress monitoring for video uploads

## Benefits
1. **Reliability**: Automatic retry mechanism handles temporary network issues
2. **Performance**: Chunked uploads improve reliability for large files
3. **User Experience**: Better error messages help users understand issues
4. **Monitoring**: Progress tracking and detailed logging for debugging
5. **Scalability**: Video streaming optimizations for better playback

## Testing Recommendations
1. Test with various file sizes (small, medium, large)
2. Test with poor network conditions
3. Verify timeout handling works correctly
4. Check that retry mechanism functions properly
5. Validate error messages are user-friendly

## Environment Variables Required
- `CLOUD_NAME`: Cloudinary cloud name
- `API_KEY`: Cloudinary API key
- `API_SECRET`: Cloudinary API secret
- `FOLDER_NAME`: Upload folder name (optional, defaults to 'course-content')
- `CLOUDINARY_NOTIFICATION_URL`: Webhook URL for async processing (optional)

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/api/v1/auth/sendotp",
  SIGNUP_API: BASE_URL + "/api/v1/auth/signup",
  LOGIN_API: BASE_URL + "/api/v1/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/api/v1/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/api/v1/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/api/v1/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/api/v1/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/api/v1/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/api/v1/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/api/v1/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/api/v1/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/api/v1/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/api/v1/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/api/v1/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/api/v1/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/api/v1/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/api/v1/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/api/v1/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/api/v1/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/api/v1/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/api/v1/course/getInstructorCoursesForInstructor",
  COURSE_PURCHASE_HISTORY_API: BASE_URL + "/api/v1/payment/purchaseHistory",
  DELETE_SECTION_API: BASE_URL + "/api/v1/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/api/v1/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/api/v1/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: BASE_URL + "/api/v1/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/api/v1/course/updateCourseProgress",
  UPDATE_QUIZ_PROGRESS_API: BASE_URL + "/api/v1/course/updateQuizProgress",
  CHECK_SECTION_ACCESS_API: BASE_URL + "/api/v1/course/checkSectionAccess",
  GET_PROGRESS_PERCENTAGE_API: BASE_URL + "/api/v1/course/getProgressPercentage",
  CREATE_RATING_API: BASE_URL + "/api/v1/course/createRating",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/api/v1/course/getReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/api/v1/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/api/v1/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/api/v1/contact/submit",
}

// CONTACT MESSAGE ENDPOINTS (Admin)
export const contactMessageEndpoints = {
  GET_ALL_MESSAGES_API: BASE_URL + "/api/v1/contact/messages",
  MARK_MESSAGE_READ_API: BASE_URL + "/api/v1/contact/messages/:messageId/mark-read",
  DELETE_MESSAGE_API: BASE_URL + "/api/v1/contact/messages/:messageId",
  GET_MESSAGE_STATS_API: BASE_URL + "/api/v1/contact/stats",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/api/v1/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/api/v1/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/api/v1/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/api/v1/profile/deleteProfile",
}

// FEATURED COURSES ENDPOINTS
export const featuredCoursesEndpoints = {
  GET_FEATURED_COURSES_API: BASE_URL + "/api/v1/featured-courses",
  UPDATE_FEATURED_COURSES_API: BASE_URL + "/api/v1/featured-courses/update",
}

// ADMIN ENDPOINTS
export const adminEndpoints = {
  // User Management
  GET_ALL_USERS_API: BASE_URL + "/api/v1/admin/users",
  CREATE_USER_API: BASE_URL + "/api/v1/admin/users",
  UPDATE_USER_API: BASE_URL + "/api/v1/admin/users/:userId",
  DELETE_USER_API: BASE_URL + "/api/v1/admin/users/:userId",
  TOGGLE_USER_STATUS_API: BASE_URL + "/api/v1/admin/users/:userId/toggle-status",
  GET_ALL_INSTRUCTORS_API: BASE_URL + "/api/v1/admin/instructors",

  // Course Management
  GET_ALL_COURSES_API: BASE_URL + "/api/v1/admin/courses",
  CREATE_COURSE_AS_ADMIN_API: BASE_URL + "/api/v1/admin/courses/create",
  APPROVE_COURSE_API: BASE_URL + "/api/v1/admin/courses/:courseId/approve",
  ADMIN_DELETE_COURSE_API: BASE_URL + "/api/v1/admin/courses/:courseId",
  TOGGLE_COURSE_VISIBILITY_API: BASE_URL + "/api/v1/admin/courses/:courseId/toggle-visibility",
  SET_COURSE_TYPE_API: BASE_URL + "/api/v1/admin/courses/:courseId/set-type",

  // Analytics
  GET_ANALYTICS_API: BASE_URL + "/api/v1/admin/analytics",

  // Notification Management
  SEND_NOTIFICATION_API: BASE_URL + "/api/v1/admin/notifications/send",
  GET_ALL_NOTIFICATIONS_API: BASE_URL + "/api/v1/admin/notifications",
  DELETE_NOTIFICATION_API: BASE_URL + "/api/v1/admin/notifications/:notificationId",
}

// COURSE ACCESS ENDPOINTS
export const courseAccessEndpoints = {
  // Public
  GET_FREE_COURSES_API: BASE_URL + "/api/v1/course-access/free-courses",
  
  // Student
  REQUEST_COURSE_ACCESS_API: BASE_URL + "/api/v1/course-access/request-access",
  GET_USER_ACCESS_REQUESTS_API: BASE_URL + "/api/v1/course-access/my-requests",
  
  // Admin
  GET_ALL_ACCESS_REQUESTS_API: BASE_URL + "/api/v1/course-access/requests",
  HANDLE_ACCESS_REQUEST_API: BASE_URL + "/api/v1/course-access/requests/:requestId",
}

// QUIZ ENDPOINTS
export const quizEndpoints = {
  CREATE_QUIZ_API: BASE_URL + "/api/v1/quiz/create",
  UPDATE_QUIZ_API: BASE_URL + "/api/v1/quiz/update/:quizId",
  GET_QUIZ_API: BASE_URL + "/api/v1/quiz/:quizId",
  GET_ALL_QUIZZES_API: BASE_URL + "/api/v1/quiz/all",
  SUBMIT_QUIZ_API: BASE_URL + "/api/v1/quiz/submit",
  GET_QUIZ_RESULTS_API: BASE_URL + "/api/v1/quiz/results/:quizId",
  VALIDATE_SECTION_ACCESS_API: BASE_URL + "/api/v1/quiz/validate-access/:sectionId",
}

// NOTIFICATION ENDPOINTS
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: BASE_URL + "/api/v1/notification/get-notifications",
  MARK_AS_READ_API: BASE_URL + "/api/v1/notification/mark-as-read",
  MARK_ALL_READ_API: BASE_URL + "/api/v1/notification/mark-all-as-read",
  DELETE_NOTIFICATION_API: BASE_URL + "/api/v1/notification/delete",
}

// FAQ ENDPOINTS
export const faqEndpoints = {
  SUBMIT_QUESTION_API: BASE_URL + "/api/v1/faqs/ask",
  GET_ALL_FAQS_API: BASE_URL + "/api/v1/faqs/all",
  GET_PUBLISHED_FAQS_API: BASE_URL + "/api/v1/faqs/published",
  ANSWER_FAQ_API: BASE_URL + "/api/v1/faqs/answer/:id",
  TOGGLE_FAQ_PUBLISH_API: BASE_URL + "/api/v1/faqs/toggle-publish/:id",
  DELETE_FAQ_API: BASE_URL + "/api/v1/faqs/delete/:id",
}

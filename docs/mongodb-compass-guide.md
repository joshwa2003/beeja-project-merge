# MongoDB Compass Data Insertion Guide

This guide explains how to manually insert data into our database using MongoDB Compass.

## Connection Setup

1. Launch MongoDB Compass
2. Connect using the connection string: `mongodb://127.0.0.1:27017`
3. Select or create database "learnhub"

## Inserting Categories

1. In learnhub database, create collection "categories"
2. Click "Add Data" → "Insert Document"
3. Insert category data:
```json
{
  "name": "Web Development",
  "description": "Master web development from front-end to back-end"
}
```

## Inserting Profiles

1. Create collection "profiles"
2. Click "Add Data" → "Insert Document"
3. Insert profile data:
```json
{
  "gender": "Male",
  "dateOfBirth": "1990-01-01",
  "about": "Experienced web development instructor",
  "contactNumber": 1234567890
}
```
4. **Important**: Save the generated `_id` for use in user creation

## Inserting Users

1. Create collection "users"
2. Click "Add Data" → "Insert Document"
3. Insert user data (replace `<profileId>` with actual ID):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.instructor@example.com",
  "password": "instructor123",
  "accountType": "Instructor",
  "active": true,
  "approved": true,
  "additionalDetails": "<profileId>"
}
```
4. **Important**: Save the generated `_id` for use in course creation

## Inserting Courses

1. Create collection "courses"
2. Click "Add Data" → "Insert Document"
3. Insert course data (replace `<instructorId>` and `<categoryId>` with actual IDs):
```json
{
  "courseName": "Complete Web Development Bootcamp",
  "courseDescription": "Learn full-stack web development from scratch",
  "whatYouWillLearn": "HTML, CSS, JavaScript, React, Node.js, MongoDB",
  "price": 499,
  "tag": ["web development", "programming"],
  "status": "Published",
  "instructor": "<instructorId>",
  "category": "<categoryId>",
  "studentsEnrolled": [],
  "instructions": ["Basic computer knowledge required"],
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

## Best Practices

1. **Document Order**: Insert documents in this order:
   - Categories
   - Profiles
   - Users
   - Courses

2. **ID Management**:
   - After inserting each document, save its `_id`
   - Use these IDs when creating relationships between documents

3. **Data Verification**:
   - After insertion, use the "View" option to verify data
   - Check that all required fields are present
   - Verify relationships between documents using the "Filter" option

4. **Error Prevention**:
   - Backup your database before large insertions
   - Ensure all referenced IDs exist before creating relationships
   - Validate data types match the schema requirements

## Sample Data

You can find sample data in these files:
- Categories: `/backend/utils/seedCategories.js`
- Courses and Users: `/backend/utils/seedData.js`

## Troubleshooting

If you encounter errors while inserting:
1. Verify all required fields are present
2. Check that referenced IDs exist and are valid
3. Ensure data types match the schema
4. Verify the database connection is active

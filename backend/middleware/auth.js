// AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

const jwt = require("jsonwebtoken");
require('dotenv').config();


// ================ AUTH ================
// user Authentication by checking token validating
exports.auth = (req, res, next) => {
    try {
        console.log('Auth middleware called for:', req.method, req.url);
        
        // extract token by anyone from this 3 ways
        const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

        console.log('Token extraction:', {
            fromBody: !!req.body?.token,
            fromCookies: !!req.cookies?.token,
            fromHeaders: !!req.header('Authorization'),
            tokenExists: !!token,
            authHeader: req.header('Authorization'),
            tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });

        // if token is missing
        if (!token) {
            console.log('Token is missing');
            return res.status(401).json({
                success: false,
                message: 'Token is Missing'
            });
        }

        // verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified successfully:', {
                email: decode.email,
                accountType: decode.accountType,
                id: decode.id,
                tokenFull: decode
            });
            
            req.user = decode;
        }
        catch (error) {
            console.log('Error while decoding token:', error.message);
            console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
            return res.status(401).json({
                success: false,
                error: error.message,
                messgae: 'Error while decoding token'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while token validating:', error.message);
        return res.status(500).json({
            success: false,
            messgae: 'Error while token validating'
        })
    }
}





// ================ IS STUDENT ================
exports.isStudent = (req, res, next) => {
    try {
        // console.log('User data -> ', req.user)
        if (req.user?.accountType != 'Student') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for student'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with student accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with student accountType'
        })
    }
}


// ================ IS INSTRUCTOR ================
exports.isInstructor = (req, res, next) => {
    try {
        // Allow both Instructors and Admins
        if (req.user?.accountType !== 'Instructor' && req.user?.accountType !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'This page is protected for Instructors and Admins only'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while checking user validity with Instructor/Admin accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity with Instructor/Admin accountType'
        })
    }
}


// ================ IS ADMIN ================
exports.isAdmin = (req, res, next) => {
    try {
        // console.log('User data -> ', req.user)
        if (req.user.accountType != 'Admin') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Admin'
            })
        }
        // go to next middleware
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with Admin accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Admin accountType'
        })
    }
}



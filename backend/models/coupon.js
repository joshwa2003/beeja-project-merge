const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'flat']
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    usageLimit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    minimumOrderAmount: {
        type: Number,
        default: 0
    },
    linkedTo: {
        type: String,
        required: true,
        enum: ['course', 'bundle'],
        default: 'course'
    },
    showOnFront: {
        type: Boolean,
        default: false
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    startDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userUsage: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedCount: {
            type: Number,
            default: 1
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, expiryDate: 1 });
couponSchema.index({ linkedTo: 1 });
couponSchema.index({ showOnFront: 1 });

module.exports = mongoose.model("Coupon", couponSchema);

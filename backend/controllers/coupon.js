const Coupon = require('../models/coupon');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      usageLimit,
      perUserLimit,
      minimumOrderAmount,
      courses,
      categories,
      startDate,
      expiryDate,
      isActive,
      linkedTo,
      showOnFront
    } = req.body;

    // Validate unique coupon code
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Parse dates and ensure they are in UTC
    const parsedStartDate = new Date(startDate);
    const parsedExpiryDate = new Date(expiryDate);

    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedExpiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Ensure expiry date is after start date
    if (parsedExpiryDate <= parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after start date'
      });
    }

    // Create new coupon with parsed dates
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      usageLimit: usageLimit || 0,
      perUserLimit: perUserLimit || 0,
      minimumOrderAmount: minimumOrderAmount || 0,
      courses: courses || [],
      categories: categories || [],
      startDate: parsedStartDate,
      expiryDate: parsedExpiryDate,
      isActive: isActive !== undefined ? isActive : true,
      linkedTo: linkedTo || 'course',
      showOnFront: showOnFront || false
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: newCoupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Validate a coupon code
exports.validateCoupon = async (req, res) => {
  try {
    const { code, courseId, totalAmount, checkoutType } = req.body;
    const userId = req.user.id;

    console.log('Validating coupon:', {
      code: code.toUpperCase(),
      checkoutType,
      totalAmount,
      userId
    });

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      linkedTo: checkoutType // Only find coupons linked to this checkout type
    });

    console.log('Found coupon:', coupon ? {
      code: coupon.code,
      linkedTo: coupon.linkedTo,
      isActive: coupon.isActive,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    } : 'No coupon found');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code or not applicable for this checkout type'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not active'
      });
    }

    // Check expiry - use more precise date comparison
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expiryDate);
    
    if (now < startDate) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not yet active'
      });
    }
    
    if (now > expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    // Check per-user limit
    const userUsage = coupon.userUsage.find(u => u.user.toString() === userId);
    if (coupon.perUserLimit > 0 && userUsage && userUsage.usedCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: 'You have exceeded the usage limit for this coupon'
      });
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount > 0 && totalAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, totalAmount);

    return res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Apply a coupon (update usage counts)
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Update usage counts
    coupon.usedCount += 1;

    // Update user usage
    const userUsageIndex = coupon.userUsage.findIndex(u => u.user.toString() === userId);
    if (userUsageIndex >= 0) {
      coupon.userUsage[userUsageIndex].usedCount += 1;
    } else {
      coupon.userUsage.push({ user: userId, usedCount: 1 });
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all coupons (admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Coupons fetched successfully',
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get frontend coupons (public endpoint)
exports.getFrontendCoupons = async (req, res) => {
  try {
    const { linkedTo } = req.query;
    const now = new Date();
    
    // Build filter object
    const filter = {
      showOnFront: true,
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gt: now } // Use $gt instead of $gte to ensure coupon hasn't expired
    };

    // Add linkedTo filter if provided
    if (linkedTo) {
      // Ensure linkedTo matches exactly one of the allowed values
      if (!['course', 'bundle'].includes(linkedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid linkedTo value. Must be either "course" or "bundle".'
        });
      }
      filter.linkedTo = linkedTo;
    }
    
    // Filter coupons that should be shown on frontend
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Frontend coupons fetched successfully',
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching frontend coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle coupon status (active/inactive)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Toggle the isActive status
    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

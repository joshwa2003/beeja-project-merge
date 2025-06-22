const ContactMessage = require("../models/contactMessage");
const mailSender = require("../utils/mailSender");

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { firstname, lastname, email, phoneNo, countrycode, message } = req.body;

    // Validate required fields
    if (!firstname || !email || !phoneNo || !countrycode || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      firstname,
      lastname,
      email,
      phoneNo,
      countrycode,
      message,
    });

    // Send confirmation email to user
    try {
      await mailSender(
        email,
        "Thank you for contacting us - Beeja Academy",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for reaching out!</h2>
          <p>Dear ${firstname},</p>
          <p>We have received your message and will get back to you within 24-48 hours.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p>${message}</p>
          </div>
          <p>Best regards,<br>Beeja Academy Team</p>
        </div>
        `
      );
    } catch (emailError) {
      console.log("Error sending confirmation email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contactMessage,
    });

  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all contact messages (Admin only)
exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully",
      data: messages,
    });

  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark message as read (Admin only)
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });

  } catch (error) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete contact message (Admin only)
exports.deleteContactMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ContactMessage.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get contact message statistics (Admin only)
exports.getContactMessageStats = async (req, res) => {
  try {
    const totalMessages = await ContactMessage.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ status: "unread" });
    const readMessages = await ContactMessage.countDocuments({ status: "read" });

    // Get messages from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMessages = await ContactMessage.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    return res.status(200).json({
      success: true,
      message: "Contact message statistics fetched successfully",
      data: {
        total: totalMessages,
        unread: unreadMessages,
        read: readMessages,
        recent: recentMessages,
      },
    });

  } catch (error) {
    console.error("Error fetching contact message stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error('Mail configuration is missing. Please check environment variables.');
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: 'StudyNotion || by Aniruddha Gade',
            to: email,
            subject: title,
            html: body
        });

        console.log('Email sent successfully to:', email);
        return info;
    }
    catch (error) {
        console.error('Error while sending mail:', {
            email,
            error: error.message,
            stack: error.stack
        });
        throw error; // Propagate error to handle it in the calling function
    }
}

module.exports = mailSender;
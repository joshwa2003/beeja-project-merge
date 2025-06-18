const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        // Use environment variables if available, otherwise use development config
        const mailConfig = {
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: process.env.MAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER || 'your-email@gmail.com',
                pass: process.env.MAIL_PASS || 'your-app-specific-password'
            }
        };

        console.log('Mail configuration:', {
            host: mailConfig.host,
            user: mailConfig.auth.user,
            configured: !!(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS)
        });

        const transporter = nodemailer.createTransport(mailConfig);

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
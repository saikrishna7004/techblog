import nodemailer from 'nodemailer';

export default async function sendEmail({ to, subject, text }) {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'your-email@example.com',
            pass: 'your-email-password',
        },
    });

    // Prepare email options
    const mailOptions = {
        from: 'your-email@example.com',
        to,
        subject,
        text,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

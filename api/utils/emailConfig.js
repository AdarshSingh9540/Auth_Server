const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

const sendResetEmail = (email, token) => {
    const resetURL = `http://localhost:3003/reset-password?token=${token}`;

    return transporter.sendMail({
        to: email,
        from: 'adarsh9540984202@gmail.com',
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset</p>
               <p>Click <a href="${resetURL}">here</a> to reset your password</p>`
            }).then(info => {
                console.log('Email sent: ', info.response);
            }).catch(error => {
                console.error('Error sending email:', error);
            });
};

module.exports = sendResetEmail;

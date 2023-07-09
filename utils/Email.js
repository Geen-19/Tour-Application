const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // create a transport
    const transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '5da2c21c60e025',
            pass: '71bb283cf9d4ca'

        }
        // Activate in gmail "less secure app" option
    })
    //2) define the mail options
    const mailOptions = {
        from: 'Geen Donald Joel <admin@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        

    }

    // 3) Actually send mail
     await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;
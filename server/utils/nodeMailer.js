const nodemailer = require('nodemailer');
const { TYPES, MESSAGES } = require('../configs/constants');

const sendVerificationMail = (email, token, req, res) => {
    var transporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: process.env.GMAIL_USERNAME, 
            pass: process.env.GMAIL_PASSWORD 
        } 
    });
    var mailOptions = { 
        from: 'no-reply@stickeroo.com', 
        to: email, 
        subject: 'Account Verification Token', 
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verifyAccount\/' + token.token + '.\n' 
    };

    return transporter.sendMail(mailOptions, function (err) {
        
        if (err) { 
            return res.status(400).json({
                type: TYPES.FAILED_TO_SEND_VERIFICATION_EMAIL,
                message: MESSAGES.FAILED_TO_SEND_VERIFICATION_EMAIL
            })
        }
        
        console.log("success cb")
        return res.status(200).json({
            type: TYPES.VERIFICATION_EMAIL_SENT,
            message: MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESS + email
        })
    });
}

module.exports = {
    sendVerificationMail
}
const nodemailer = require('nodemailer');

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
                type: 'failed-to-send-verification-email',
                message: 'Failed to send an email'
            })
        }
        
        console.log("success cb")
        return res.status(200).json({
            type: 'verification-email-sent',
            message: 'A verification email has been sent to ' + email + '.'
        })
    });
}

module.exports = {
    sendVerificationMail
}
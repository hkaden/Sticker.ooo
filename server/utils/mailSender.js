const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
const { TYPES, MESSAGES } = require('../configs/constants');
const getVerificationEmail = require('./getVerificationEmail')

const sendEmail = (email, subject, content, req, res, successReturn, failedReturn) => {
  const mailOptions = {
    from: 'Sticker.ooo <account@sticker.ooo>',
    to: email,
    subject: subject,
    html: content,
  };

  mailgun.messages().send(mailOptions, function (error, body) {
    if (error) {
      return res.status(400).json(failedReturn);
    }

    return res.status(200).json(successReturn);
  });
};

const sendVerificationEmail = (email, token, req, res) => {
  const subject = 'Sticker.ooo Email Verification';
  const url = `${req.protocol}://${req.headers.host}/api/verifyAccount/${token}`
  const successReturn = {
    type: TYPES.VERIFICATION_EMAIL_SENT,
    message: MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESS + email
  };
  const failedReturn = {
    type: TYPES.FAILED_TO_SEND_VERIFICATION_EMAIL,
    message: MESSAGES.FAILED_TO_SEND_VERIFICATION_EMAIL,
  };
  sendEmail(email, subject, getVerificationEmail(url), req, res, successReturn, failedReturn);
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
};

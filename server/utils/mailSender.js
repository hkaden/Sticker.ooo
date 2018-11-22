const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
const { TYPES, MESSAGES } = require('../configs/constants');
const getHtmlEmail = require('./getVerificationEmail')

const sendEmail = (email, subject, content, req, res, successReturn, failedReturn) => {
  const mailOptions = {
    from: 'Sticker.ooo <account@sticker.ooo>',
    to: email,
    subject: subject,
    html: content,
  };

  mailgun.messages().send(mailOptions, function (error, body) {
    if (error) {
      console.error(error)
      return res.status(400).json(failedReturn);
    }

    return res.status(200).json(successReturn);
  });
};

const sendVerificationEmail = (email, token, req, res) => {
  const subject = 'Sticker.ooo Email Verification';
  const content = `Please verify your account by clicking <a href="${req.protocol}://${req.headers.host}/api/verifyAccount/${token}">here</a>`
  const successReturn = {
    type: TYPES.VERIFICATION_EMAIL_SENT,
    message: MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESS + email
  };
  const failedReturn = {
    type: TYPES.FAILED_TO_SEND_VERIFICATION_EMAIL,
    message: MESSAGES.FAILED_TO_SEND_VERIFICATION_EMAIL,
  };
  sendEmail(email, subject, getHtmlEmail(content), req, res, successReturn, failedReturn);
}

const sendForgetPasswordEmail = (email, token, req, res) => {
  const subject = 'Sticker.ooo Password Reset';
  const content = ` You recently have requested to reset password. Please do it by clicking <a href="${req.protocol}://${req.headers.host}/resetPassword/${token}">here</a>`
  const successReturn = {
    type: TYPES.RESET_PASSWORD_EMAIL_SENT,
    message: MESSAGES.RESET_PASSWORD_EMAIL_SENT_SUCCESS + email
  };
  const failedReturn = {
    type: TYPES.FAILED_TO_SEND_RESET_PASSWORD_EMAIL,
    message: MESSAGES.FAILED_TO_SEND_RESET_PASSWORD_EMAIL,
  };
  sendEmail(email, subject, getHtmlEmail(content), req, res, successReturn, failedReturn);
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendForgetPasswordEmail
};

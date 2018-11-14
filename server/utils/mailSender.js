const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
const { TYPES, MESSAGES } = require('../configs/constants');

const sendVerificationMail = (email, token, req, res) => {
  const mailOptions = {
    from: 'Sticker.ooo <postmaster@mg.stickeroo.com>',
    to: email,
    subject: 'Sticker.ooo Email Verification',
    text: `${'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/'}${req.headers.host}\/verifyAccount\/${token.token}.\n`,
  };

  mailgun.messages().send(mailOptions, function (error, body) {
    if (error) {
      console.error(error)
      return res.status(400).json({
        type: TYPES.FAILED_TO_SEND_VERIFICATION_EMAIL,
        message: MESSAGES.FAILED_TO_SEND_VERIFICATION_EMAIL,
      });
    }

    return res.status(200).json({
      type: TYPES.VERIFICATION_EMAIL_SENT,
      message: MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESS + email,
    });
  });
};

module.exports = {
  sendVerificationMail,
};

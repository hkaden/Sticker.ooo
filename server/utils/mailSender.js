const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
const { TYPES, MESSAGES } = require('../configs/constants');

const sendEmail = (email, subject, content, req, res, successReturn, failedReturn) => {
  const mailOptions = {
    from: 'Sticker.ooo <postmaster@mg.stickeroo.com>',
    to: email,
    subject: subject,
    text: content,
  };

  mailgun.messages().send(mailOptions, function (error, body) {
    if (error) {
      return res.status(400).json(failedReturn);
    }

    return res.status(200).json(successReturn);
  });
};

module.exports = {
  sendEmail,
};

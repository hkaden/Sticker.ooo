const nodemailer = require('nodemailer');
const { TYPES, MESSAGES } = require('../configs/constants');

const sendEmail = (email, subject, content, req, res, successReturn, failedReturn) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: 'no-reply@stickeroo.com',
    to: email,
    subject: subject,
    text: content,
  };

  return transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(400).json(failedReturn);
    }

    return res.status(200).json(successReturn);
  });
};

module.exports = {
  sendEmail,
};

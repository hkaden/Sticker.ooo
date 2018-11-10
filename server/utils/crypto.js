const crypto = require('crypto');
const md5 = require('md5');

module.exports.encrypt = function (content) {
  const IV_LENGTH = 16;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('AES-256-CBC', Buffer.from(md5(process.env.CRYPTO_PASSPHRASE)), iv);
  let encrypted = cipher.update(content);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

module.exports.decrypt = function (content) {
  const textParts = content.split(':');
  const iv = Buffer.from(textParts.shift(), 'HEX');
  const encryptedContent = Buffer.from(textParts.join(':'), 'HEX');
  const decipher = crypto.createDecipheriv('AES-256-CBC', Buffer.from(md5(process.env.CRYPTO_PASSPHRASE)), iv);
  let decrypted = decipher.update(encryptedContent);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

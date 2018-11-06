const crypto = require('crypto');
const md5 = require('md5');

module.exports.encrypt = function (content) {
  let iv_length = 16;
  let iv = crypto.randomBytes(iv_length);
  let cipher = crypto.createCipheriv('AES-256-CBC', Buffer.from(md5(process.env.CRYPTO_PASSPHRASE)), iv);
  let encrypted = cipher.update(content);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

module.exports.decrypt = function (content) {
  let textParts = content.split(':');
  let iv = Buffer.from(textParts.shift(), 'HEX');
  let encryptedContent = Buffer.from(textParts.join(':'), 'HEX');
  let decipher = crypto.createDecipheriv('AES-256-CBC', Buffer.from(md5(process.env.CRYPTO_PASSPHRASE)), iv);
  let decrypted = decipher.update(encryptedContent);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}


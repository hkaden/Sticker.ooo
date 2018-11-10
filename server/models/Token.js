const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    uuid: { type: String, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

TokenSchema.methods.setToken = function(email) {
    const salt = crypto.randomBytes(16).toString('hex');
    this.token = crypto.pbkdf2Sync(email, salt, 10000, 512, 'sha512').toString('hex');
  };

module.exports = mongoose.model('Token', TokenSchema);
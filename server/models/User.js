const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const patchHistory = require('mongoose-patch-history').default;
const { pascalize } = require('humps');
const fs = require('fs');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    maxLength: 20,
  },
  password: { type: String, required: true },
  email: {
    type: String, required: true, unique: true, lowerCase: true, minLength: 4, maxLength: 40,
  },
  emailExternal: {
    type: String, minLength: 4, maxLength: 40,
  },
  salt: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: { type: String },
  updatedBy: { type: String },
  role: { type: String, default: 'user', enum: ['user', 'admin']}
});

UsersSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.password === hash;
};

UsersSchema.methods.generateJWT = function () {
  const cert = fs.readFileSync(`${__dirname}/../private.pem`);
  return jwt.sign({
    username: this.username,
    email: this.email,
    uuid: this.uuid,
    role: this.role
  }, cert, {
    algorithm: 'RS256',
    expiresIn: '60 days',
  });
};

UsersSchema.methods.verifyJWT = function (token) {
  const cert = fs.readFileSync(`${__dirname}/../public.pem`);
  return jwt.verify(token, cert, { algorithm: 'RS256' }, function(err, payload) {
    return err ? null : payload;
  });

}

UsersSchema.methods.toAuthJSON = function () {
  return {
    uuid: this.uuid,
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    role: this.role
  };
};

UsersSchema.plugin(patchHistory, { mongoose, name: 'usersPatches', transforms: [pascalize, v => v] });

module.exports = mongoose.model('User', UsersSchema);

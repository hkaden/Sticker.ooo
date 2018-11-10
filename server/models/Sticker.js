const mongoose = require('mongoose');
const patchHistory = require('mongoose-patch-history').default;
const { pascalize } = require('humps');
const { arrayLengthValidator } = require('../utils/validators');

const Schema = mongoose.Schema;

const stickersValidators = [
  arrayLengthValidator({ minLength: 1 }),
  {
    validator: packs => packs.every(
      pack => arrayLengthValidator({
        minLength: 3,
        maxLength: 30,
      }).validator(pack),
    ),
    message: 'Each pack should have 3 - 30 sticker images',
  },
];

const stickerSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  name: {
    type: String, required: true, minLength: 1, maxLength: 128,
  },
  publisher: { type: String, required: true },
  sharingType: {
    type: String,
    default: 'public',
    enum: ['public', 'private', 'link'], // link: accessible by link, private: for logged in users to view their own stickers
  },
  tray: { type: String, required: true },
  trays: { type: [String], required: true, validate: arrayLengthValidator({ minLength: 1 }) },
  stickers: { type: [[String]], required: true, validate: stickersValidators },
  userTags: { type: [String] },
  adminTags: { type: [String] },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: { type: String },
  updatedBy: { type: String },
});

stickerSchema.plugin(patchHistory, { mongoose, name: 'stickersPatches', transforms: [pascalize, v => v] });

module.exports = mongoose.model('Sticker', stickerSchema);

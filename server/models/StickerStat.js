const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stickerStatSchema = new Schema({
  uuid: { type: String, required: true },
  time: { type: Date, required: true },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

stickerStatSchema.index({ uuid: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('StickerStat', stickerStatSchema, 'stickersStats');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stickerSchema = new Schema({
    uuid : { type: String, required: true, unique: true },
    name: { type: String, required: true },
    publisher: { type: String, required: true },
    tray: { type: Array, required: true },
    stickers: { type: Array, required: true },
    create: {
        type: Date,
        "default": Date.now
    }
});

module.exports = mongoose.model('Sticker', stickerSchema);

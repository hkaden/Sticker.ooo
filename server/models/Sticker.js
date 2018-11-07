const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stickerSchema = new Schema({
    uuid : { type: String, required: true, unique: true },
    name: { type: String, required: true },
    publisher: { type: String, required: true },
    trays: { type: Array, required: true },
    stickers: { type: Array, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Sticker', stickerSchema);

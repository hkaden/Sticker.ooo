const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const StickeroooSchema = new Schema({
  uuid: { type: String, default: uuidv4()},
  version: { type: String, required: true, unique : true },
  status: { type: String, required: true, enum: ['RUNNING', 'SUSPENDED', 'MAINTAINING'] },
  createdAt: {
    type: Date, required: true, default: Date.now,
  },
  updatedAt: {
    type: Date, required: true, default: Date.now,
  },
});

module.exports = mongoose.model('Stickerooo', StickeroooSchema);

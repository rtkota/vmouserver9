const mongoose = require('mongoose');

const Ratetable = mongoose.model('Ratetable', new mongoose.Schema({
  ccode: {
    type: String,
    required: true,
  },
  ptype: {
    type: String
  },
  rate: {
    type: Number
  }
}));

exports.Ratetable = Ratetable;
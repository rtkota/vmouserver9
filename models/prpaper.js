const mongoose = require('mongoose');

const Prpaper = mongoose.model('Prpaper', new mongoose.Schema({
  ccode: {
    type: String,
    required: true,
  },
  mmarks: Number,
}));

exports.Prpaper = Prpaper;
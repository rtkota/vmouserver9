const mongoose = require('mongoose');

const Addl = mongoose.model('Addl', new mongoose.Schema({
exam: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 6
  },
  ccode: {
    type: String,
    minlength: 3,
    maxlength: 500,
    required: true
  },
  doe: {
    type: Date
  },
  tshift: String,
  schnos: [new mongoose.Schema({
    schno: String,
  })],
  eccode: {
    type: String
  },    
  isnoaddl: Boolean,
  status: String
}));

exports.Addl = Addl;
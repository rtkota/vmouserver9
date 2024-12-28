const mongoose = require('mongoose');

const Absentee = mongoose.model('Absentee', new mongoose.Schema({
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
  isnoabsentee: Boolean,
  total: Number,
  status: String
}));

exports.Absentee = Absentee;
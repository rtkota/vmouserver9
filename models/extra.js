const Joi = require('joi');
const mongoose = require('mongoose');


const Extra = mongoose.model('Extra', new mongoose.Schema({
  batchcode: {
    type:String,
    required: true
  },
  userid: {
    type: String
  },
  exam: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 6
  },
  occode: {
    type: String,
    minlength: 3,
    maxlength: 500,
    required: true
  },
  ccode: {
    type: String,
    minlength: 3,
    maxlength: 500,
    required: true
  },
  noofcopies: Number,
  examinerid:  {type: mongoose.Schema.Types.ObjectId, ref:'Examiner'},
  dteval: Date,
  dtvmou: Date,
  copiesrecd: Number,
  awlrecd: Boolean,
  status: String
}));
exports.Extra = Extra;
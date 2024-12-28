const Joi = require('joi');
const mongoose = require('mongoose');

const Bill = mongoose.model('Bill', new mongoose.Schema({
  billno: {
    type: Number,
    required: true,
  },
  billdate: {
    type: Date
  },
  userid: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  examinerid:  {type: mongoose.Schema.Types.ObjectId, ref:'Examiner'},
  exam: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 6
  },
  gross: {
    type: Number
  },
  swf: {
    type: Number
  },
  tds: {
    type: Number
  },
  netamt: {
    type: Number
  },
  batches: [new mongoose.Schema({
    batchcode: String,
    bstatus: String,
    ccode: String,
    totalcopies: Number,
    absent: Number,
    rate: Number,
    amt: Number})],
  }));


exports.Bill = Bill; 

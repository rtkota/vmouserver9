const mongoose = require('mongoose');

const prcentreSchema = new mongoose.Schema({
  userid: {
    type: String
  },
  prcity:{type: mongoose.Schema.Types.ObjectId, ref:'Prcity'},
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  contactperson: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
  },
  status: String
});

const Prcentre = mongoose.model('prcentre', prcentreSchema);


exports.Prcentre = Prcentre; 

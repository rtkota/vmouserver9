const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const examinerSchema = new mongoose.Schema({
  userid: {
    type: String
  },
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50
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
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255
  },
  bank: {
    type: String,
    // required: true,
    maxlength: 255
  },
  branch: {
    type: String,
    maxlength: 255
  },
  accno: {
    type: String,
    // required: true,
    maxlength: 255
  },
  ifsccode: {
    type: String,
    // required: true,
    minlength: 0,
    maxlength: 11
  },
  panno: {
    type: String,
    // required: true,
    minlength: 0,
    maxlength: 10
  },
  isFirst: Boolean,
  status: String
});

examinerSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

const Examiner = mongoose.model('Examiner', examinerSchema);

function validateexaminer(examiner) {
  const schema = {
    name: Joi.string().min(4).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phone: Joi.string().min(10).max(10).required(),
    password: Joi.string().min(6).max(255).required(),
    bank: Joi.string().max(10).required(),
    branch: Joi.string().max(255).required(),
    accno: Joi.string().max(10).required(),
    ifsccode: Joi.string().min(11).max(11).required(),
    panno: Joi.string().min(10).max(10).required()
  };

  return Joi.validate(examiner, schema);
}

exports.Examiner = Examiner; 
exports.validate = validateexaminer;
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const centreSchema = new mongoose.Schema({
  eccode: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4,
    unique: true
  },
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50
  },
  explace: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50
  },
  email: {
    type: String,
    minlength: 0,
    maxlength: 255,
  },
  phone: {
    type: String,
    minlength: 0,
    maxlength: 10,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255
  },
  isFirst: Boolean,
  status: String
});

centreSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

const Centre = mongoose.model('Centre', centreSchema);

function validateCentre(centre) {
  const schema = {
    name: Joi.string().min(4).max(50).required(),
    explace: Joi.string().min(4).max(50).required(),
    email: Joi.string().min(5).max(255).email(),
    phone: Joi.string().min(10).max(10),
    password: Joi.string().min(6).max(255).required(),
  };

  return Joi.validate(centre, schema);
}

exports.Centre = Centre; 
exports.validate = validateCentre;
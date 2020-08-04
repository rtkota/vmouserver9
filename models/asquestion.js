const Joi = require('joi');
const mongoose = require('mongoose');

const Asquestion = mongoose.model('Asquestion', new mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  pcode: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  ccode: {
    type: String,
    minlength: 3,
    maxlength: 500,
    required: true
  },
  ptype: {
    type: String,
    minlength: 2,
    maxlength: 2,
    required: true
  },
  qlang: {
    type: String,
    required: true
  },
  question: {
    type: String
  },
  qurl: {
    type: String
  },
  qoptions: [new mongoose.Schema({
    optno: String,
    desc: String,
    opturl: String})],
  qanswers: [new mongoose.Schema({
        optno: String,
        })],
}));

function validateAsquestion(asquestion) {
  const schema = {
    userid: Joi.objectId().required(),
    pcode:Joi.string().min(3).max(50).required(),
    ccode:Joi.string().min(3).max(50).required(),
    ptype:Joi.string().min(2).max(2).allow(['TE','ES','PJ','PV']).required(),
    qlang: Joi.string().allow(['English','Hindi']).required(),
    question: Joi.string(),
    qurl: Joi.string(),
    qoptions:Joi.array().items(Joi.object({
      optno:Joi.string().required(),
      desc:Joi.string(),
      opturl:Joi.string()
    })),
    qanswers:Joi.array().items(Joi.string)
  };

  return Joi.validate(asquestion, schema);
}  
 

exports.Asquestion = Asquestion; 
exports.validate = validateAsquestion;
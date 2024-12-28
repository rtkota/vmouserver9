const Joi = require('joi');
const mongoose = require('mongoose');


const Batch = mongoose.model('Batch', new mongoose.Schema({
  batchcode: {
    type:String,
    required: true,
    unique:true
  },
  userid: {
    type: String
  },
  examinerid:  {type: mongoose.Schema.Types.ObjectId, ref:'Examiner'},
  type: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6
  },
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
  mmarks: {
    type: Number,
    min:10,
    max:500,
    required: true
  },
  totalcopies: {
    type: Number,
    min:1,
    required: true
  },
  bundles: {
    type: Number,
    min:1,
    required: true
  },
  prcity: {
    type: String,
  },
  attempts: {
    type: Number,
    min:0,
    max:5,
    required: true
  },
  dtcreated: {
    type: Date
  },
  dtsend: {
    type: Date
  },
  dtrecd: {
    type: Date
  },
  dtsubmitted: {
    type: Date
  },
  status: {
    type: String,
    required: true
  },
  marks: [new mongoose.Schema({
    controlno: String,
    award: Number,
    status: String})],
  invalid: [new mongoose.Schema({
    controlno: String,
    marks: Number,
    copyno: String})],
  }));

function validateBatchCreate(batch) {
  const schema = {
    batchcode: Joi.string().required(),
    status: Joi.string().allow(['created','saved','submitted']).required(),
    exam: Joi.string().min(5).max(6).required(),
    ccode:Joi.string().min(3).max(50).required(),
    mmarks:Joi.number().min(10).max(500).required(),
    totalcopies:Joi.number().min(1).required(),
    bundles:Joi.number().min(1).required(),
    attempts:Joi.number().min(0).max(5).required(),
    dtcreated:Joi.date(),
    type:Joi.string().allow(['marks1','marks2','reval1','reval2']).required(),
    marks:Joi.array().items(Joi.object({
      controlno:Joi.string().required(),
      award:Joi.number().required(),
      status:Joi.string().allow(['  ','Ab','UM','ZE']).required()})),
    invalid:Joi.array().items(Joi.object({
      controlno:Joi.string().required(),
      marks:Joi.number().required(),
      copyno:Joi.strint().required()
    }))
  };

  return Joi.validate(batch, schema);
}  
function validateBatch(batch) {
  const schema = {
    batchcode: Joi.string().required(),
    userid: Joi.objectId().required(),
    status: Joi.string().allow(['created','saved','submitted']).required(),
    exam: Joi.string().min(5).max(6).required(),
    ccode:Joi.string().min(3).max(50).required(),
    ptype:Joi.string().min(2).max(2).allow(['TE','ES','PJ','PV']).required(),
    mmarks:Joi.number().min(10).max(500).required(),
    totalcopies:Joi.number().min(1).required(),
    bundles:Joi.number().min(1).required(),
    attempts:Joi.number().min(0).max(5).required(),
    dtcreated:Joi.date(),
    type:Joi.string().allow(['marks1','marks2','reval1','reval2']).required(),
    marks:Joi.array().items(Joi.object({
      controlno:Joi.string().required(),
      award:Joi.number().required(),
      status:Joi.string().allow(['  ','Ab','UM','ZE']).required()
    }))
  };

  return Joi.validate(batch, schema);
}  

function validateBatchMarks(batch) {
  const schema = {
    status: Joi.string().allow(['created','saved','submitted']).required(),
    marks:Joi.array().items(Joi.object({
      controlno:Joi.string().required(),
      award:Joi.number().required(),
      status:Joi.string().allow(['  ','Ab','UM','ZE']).required()
    }))
  };

  return Joi.validate(batch, schema);
}  

exports.Batch = Batch; 
exports.validate = validateBatch;
exports.validateCreate = validateBatchCreate;
exports.validateMarks = validateBatchMarks;
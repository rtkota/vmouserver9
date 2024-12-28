const mongoose = require('mongoose');

const Prcity = mongoose.model('Prcity', new mongoose.Schema({
  userid:{type: mongoose.Schema.Types.ObjectId, ref:'user'},
  explace: {
    type: String,
    required: true,
  }
}));

exports.Prcity = Prcity;
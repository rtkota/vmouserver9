const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const {Asquestion, validate} = require('../models/asquestion'); 
const express = require('express');
const router = express.Router();

router.post('/',  async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const asquestion = new Asquestion(req.body);
  await asquestion.save();
  
  res.send(asquestion);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
  
  const asquestion = await Asquestion.findByIdAndUpdate(req.params.id,
    { 
      userid: req.body.userid,
      pcode: req.body.pcode,
      ccode: req.body.ccode,
      ptype: req.body.ptype,
      qlang: req.body.qlang,
      question: req.body.question,
      qurl: req.body.qurl,
      qoptions: req.body.qoptions,
      qanswers: req.body.qanswers
    }, { new: true });

  if (!asquestion) return res.status(404).send('The Question with the given ID was not found.');
  
  res.send(asquestion);
});

router.get('/user/:asqid', auth, async (req, res) => {
  const query = {"userid":req.params.uid, "status":"created"};
  const batches = await Batch.find(query).sort('userid');
  var batcharray = batches.filter(function(b, index, arr){ return b.attempts < 5;});
  res.send(batcharray);
});

router.get('/:bcd', auth, async (req, res) => { 
  const query = {"batchcode":req.params.bcd};
  const batch = await Batch.findOne(query);
 
  if (!batch) return res.status(400).send('Batch Not Found.');
  const atm = batch.attempts+1;
  const batch1 = await Batch.findByIdAndUpdate(batch._id,
    { 
      attempts: atm
    }, { new: true });

  res.send(batch1);
});






module.exports = router; 
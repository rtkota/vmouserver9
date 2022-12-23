const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const {Batch, validate, validateCreate,validateMarks} = require('../models/batch'); 
const express = require('express');
const router = express.Router();

router.get('/user/:uid', auth, async (req, res) => {
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

router.post('/',  async (req, res) => {
  const { error } = validateCreate(req.body); 
  if (error) return res.status(400).send("Validation Error");
  const query = {"batchcode":req.body.batchcode};
  
  const batch1 = await Batch.find(query);
  if (batch1.length>0) return res.status(400).send('Duplicate Batch / Batch Already Exists.');
  const batch = new Batch(req.body);
  await batch.save();
  
  res.send(batch);
});

router.put('/save/:id', [auth, validateObjectId], async (req, res) => {
  const { error } = validateMarks(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  const batch = await Batch.findByIdAndUpdate(req.params.id,
    { 
      marks: req.body.marks,
      status: req.body.status
    }, { new: true });

  if (!batch) return res.status(404).send('The batch with the given ID was not found.');
  
  res.send(batch);
});

router.put('/submit/:id', [auth, validateObjectId], async (req, res) => {
  const { error } = validateMarks(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const batch = await Batch.findByIdAndUpdate(req.params.id,
    { 
      marks: req.body.marks,
      status: 'submitted',
      dtsubmitted: Date.now()
    }, { new: true });

  if (!batch) return res.status(404).send('The batch with the given ID was not found.');
  
  res.send(batch);
});


module.exports = router; 
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const mongoose = require('mongoose');
const {Addl} = require('../models/addl'); 
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  let addl = new Addl({
    exam: req.body.exam,
    ccode:req.body.ccode,
    doe: req.body.doe,
    tshift: req.body.tshift,
    eccode: req.body.eccode,
    isnoaddl: false,
    status: 'pending'
  });
  addl = await addl.save();
  res.send(addl);
});

router.put('/', auth, async (req, res) => {
  const addl = await Addl.findOneAndUpdate({'exam':req.body.exam, eccode:req.body.eccode, ccode : req.body.ccode},
  { 
    schnos: req.body.schnos,
    isnoaddl: req.body.isnoaddl,
    status: req.body.status
  }, { new: true });
  if (!addl) return res.status(404).send('The Paper detail was not found.');
  res.send(addl);
});

router.post('/forentry', async (req, res) => { 
  const list = await Addl.find({exam:req.body.exam,status:'pending', eccode: req.body.eccode}).sort({doe:1,tshift:1}).limit(1);
  if (list.length === 0) return res.status(400).send('No Pending Exam Found.');
  res.send(list[0]);
});

router.post('/pending', async (req, res) => { 
  let pdt=new Date(req.body.currdate);
  //let v1=pdt.valueOf()+(24*60*60*1000);
  //pdt=new Date(v1);
  //console.log(pdt.toISOString())
  const list = await Addl.aggregate([
    {$match: {exam:req.body.exam,status:'pending', doe: {$lte : pdt}}},
    {$lookup:{
      localField:"eccode",
      from:"centres",
      foreignField:"eccode",
      as:"explace"
    }},
    {
      $addFields: {
        explace: { $arrayElemAt: ["$explace.name", 0] },
        phone: { $arrayElemAt: ["$explace.phone", 0] },
      }
    },
    {
      $sort: {eccode:1,doe:1,tshift:1}
    }
  ]); 
  if (list.length === 0) return res.status(400).send('No Pending Exam Found.');
  res.send(list);
});

router.post('/posting', async (req, res) => { 
  let batch=[];
  batch = await Addl.find({exam:req.body.exam, status: {$in: ['submitted']}}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = batch.map(e => {
    return {'id':e._id, 'ccode':e.ccode, 'explace':e.explace, 'schnos':e.schnos}});
    res.send(batch1);
});

router.put('/batchpost/', async (req, res) => {
  const j = await Addl.findByIdAndUpdate(req.body.id,
  {
    $set :{status:'posted'}
  }, { new: true });
  res.send("Success");
});

module.exports = router; 
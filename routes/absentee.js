const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const mongoose = require('mongoose');
const {Absentee} = require('../models/absentee'); 
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  let absentee = new Absentee({
    exam: req.body.exam,
    ccode:req.body.ccode,
    doe: req.body.doe,
    tshift: req.body.tshift,
    eccode: req.body.eccode,
    total: req.body.total,
    isnoabsentee: false,
    status: 'pending'
  });
  absentee = await absentee.save();
  res.send(absentee);
});

router.put('/', auth, async (req, res) => {
  const absentee = await Absentee.findOneAndUpdate({'exam':req.body.exam, eccode:req.body.eccode, ccode : req.body.ccode},
  { 
    schnos: req.body.schnos,
    isnoabsentee: req.body.isnoabsentee,
    total: req.body.total,
    status: req.body.status
  }, { new: true });
  if (!absentee) return res.status(404).send('The Paper detail was not found.');
  res.send(absentee);
});

router.put('/revert', auth, async (req, res) => {
  const absentee = await Absentee.findOneAndUpdate({status:'submitted',exam:req.body.exam, eccode:req.body.eccode, ccode : req.body.ccode},
  { 
    status: 'pending'
  }, { new: true });
  if (!absentee) return res.status(404).send('The Paper detail was not found or Not Submitted.');
  res.send('Successfully Reverted');
});

router.post('/forentry', async (req, res) => { 
  const list = await Absentee.find({exam:req.body.exam,status:'pending', eccode: req.body.eccode}).sort({doe:1,tshift:1}).limit(1);
  if (list.length === 0) return res.status(400).send('No Pending Exam Found.');
  res.send(list[0]);
});

router.post('/forreport', async (req, res) => { 
  const list = await Absentee.findOne({exam:req.body.exam, eccode: req.body.eccode, ccode: req.body.ccode});
  if (!list) return res.status(400).send('Absentee Not Found');
  if (list.isnoabsentee) return res.status(400).send('No/Nil Absentee');
  if (list.schnos.length === 0) return res.status(400).send('Absentee NOT yet Entered');
  res.send(list);
});

router.post('/pending', async (req, res) => { 
  let pdt=new Date(req.body.currdate);
  //let v1=pdt.valueOf()+(24*60*60*1000);
  //pdt=new Date(v1);
  //console.log(pdt.toISOString())
  const list = await Absentee.aggregate([
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
  batch = await Absentee.find({exam:req.body.exam, status: {$in: ['submitted']}}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = batch.map(e => {
    return {'id':e._id, 'ccode':e.ccode, 'explace':e.explace, 'schnos':e.schnos}});
    res.send(batch1);
});

router.put('/batchpost/', async (req, res) => {
  const j = await Absentee.findByIdAndUpdate(req.body.id,
  {
    $set :{status:'posted'}
  }, { new: true });
  res.send("Success");
});


module.exports = router; 
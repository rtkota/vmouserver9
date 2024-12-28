const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const mongoose = require('mongoose');
const {Bill} = require('../models/bill'); 
const {Batch} = require('../models/batch'); 
const {Ratetable} = require('../models/ratetable'); 
const express = require('express');
const router = express.Router();

router.put('/ByExaminer', auth, async (req, res) => {
    const id = mongoose.Types.ObjectId(req.body.examinerid);
    const bills = await Bill.find({exam:req.body.exam, examinerid:id}).populate({path:'examinerid'});
    if (bills.length===0) return res.status(400).send('Bills Not Found.');
    res.send(bills);
});
router.put('/ByCoord', auth, async (req, res) => {
  const id = mongoose.Types.ObjectId(req.body.userid);
  const bills = await Bill.find({exam:req.body.exam, userid:id}).populate({path:'userid examinerid'});
  if (bills.length===0) return res.status(400).send('Bills Not Found.');
  res.send(bills);
});

router.post('/', auth, async (req, res) => {
  let batch=[];
  batch = await Batch.find({exam:req.body.exam,examinerid:req.body.examinerid, status: {$in: ['submitted']}}).populate({path:'examinerid'}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No Pending Batch Found.');
  let bill = await Bill.findOne({'exam':req.body.exam}).sort({billno:-1}).limit(1);
  let newno = 0;
  if (bill) newno=bill.billno;
  let i=0;
  let abs=0;
  let b=[];
  let tcopies,gross,swf,tds;
  let ccoderate;
  let chkbilled=[];
  let aamt =0;
  for(i=0;i<batch.length;i++) {
    chkbilled = await Bill.find({"batches.batchcode":batch[i].batchcode});
    if (chkbilled.length > 0) continue;
    abs = batch[i].marks.filter(x => (x.status.trim().toUpperCase()==='AB')).length;
    ccoderate = await Ratetable.findOne({"ccode":batch[i].ccode});
    tcopies = batch[i].totalcopies- abs + (batch[i].invalid?batch[i].invalid.length:0);
    aamt = tcopies * ccoderate.rate;
    if (aamt<300) aamt=300;
    b.push({"batchcode":batch[i].batchcode, "bstatus":batch[i].status, "ccode":batch[i].ccode, "totalcopies":tcopies+abs, "absent":abs, "rate":ccoderate.rate, "amt":  aamt})
    bupd = await Batch.updateOne({batchcode:batch[i].batchcode},
      {
        $set :{status:'billed'}
      }, { new: true });   
  }
  gross = b.map(item => item.amt).reduce((acc,curr)=>acc+curr);
  swf = Math.round((gross * 4/100));
  tds = Math.round((gross * 10/100));
  bill = new Bill({
    userid: batch[0].userid,
    examinerid:req.body.examinerid,
    billno: newno+1,
    billdate: new Date(),
    exam: req.body.exam,
    batches: b,
    gross: gross,
    swf: swf,
    tds: tds,
    netamt: gross-swf-tds,
  });
  bill = await bill.save();
  res.send(bill);
});

router.put('/', auth, async (req, res) => {
  const bill = await Bill.findOneAndUpdate({'exam':req.body.exam, billno : req.body.billno},
  { 
    userid: req.body.userid,
    examinerid:req.body.examinerid,
    billdate: req.body.billdate,
    exam: req.body.exam,
    batches: req.body.batches,
    gross: req.body.gross,
    swf: req.body.swf,
    tds: req.body.tds,
    netamt: req.body.netamt,
}, { new: true });
  if (!bill) return res.status(404).send('The Bill was not found.');
  res.send(bill);
});

router.put('/billdelete', auth, async (req, res) => {
  const bill = await Bill.findOne({'exam':req.body.exam, billno : req.body.billno})
  if (!bill) return res.status(400).send('Bill not Found.');
  for(i=0;i<bill.batches.length;i++) {
    if (bill.batches[i].dtrecd) return res.status(400).send('Batches Already Submitted. Cannot Delete Bill Now');
  }
  for(i=0;i<bill.batches.length;i++) {
    bupd = await Batch.updateOne({batchcode:bill.batches[i].batchcode},
      {
        $set :{status:bill.batches[i].bstatus}
      }, { new: true });   
  }
  const b = await Bill.findOneAndRemove({exam:req.body.exam,billno:req.body.billno})
  res.send("Bill Deleted Successfully");
});

module.exports = router; 
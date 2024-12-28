const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const mongoose = require('mongoose');
const {Extra} = require('../models/extra'); 
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  let extra = new Extra({
    batchcode: req.body.batchcode,
    userid: req.body.userid,
    exam: req.body.exam,
    occode:req.body.occode,
    ccode: req.body.ccode,
    noofcopies: req.body.noofcopies,
    examinerid:req.body.examinerid,
    dteval: req.body.dteval,
    dtvmou: req.body.dtvmou,
    copiesrecd: req.body.copiesrecd,
    awlrecd: req.body.awlrecd,
    marksentered: req.body.marksentered,
    status: 'entered'
  });
  extra = await extra.save();
  res.send(extra);
});

router.put('/', auth, async (req, res) => {
  const extra = await Extra.findOneAndUpdate({'exam':req.body.exam, batchcode:req.body.batchcode, ccode : req.body.ccode},
  { 
    noofcopies: req.body.noofcopies,
    dteval: req.body.dteval,
    dtvmou: req.body.dtvmou,
    copiesrecd: req.body.copiesrecd,
    awlrecd: req.body.awlrecd,
    marksentered: req.body.marksentered,
    status: req.body.status
  }, { new: true });
  if (!extra) return res.status(404).send('The Extra Copies detail was not found.');
  res.send(extra);
});

router.put('/examupdate', async (req, res) => {
  const extra = await Extra.findOneAndUpdate({ batchcode:req.body.batchcode},
  { 
    dtvmou: new Date(req.body.dtvmou),
    copiesrecd: req.body.copiesrecd,
    awlrecd: req.body.awlrecd,
    status: req.body.status
  }, { new: true });
  if (!extra) return res.status(404).send('The Extra Copies detail was not found.');
  res.send(extra);
});

router.put('/delete', auth, async (req, res) => {
  const b = await Extra.findOneAndRemove({ccode:req.body.ccode,batchcode:req.body.batchcode})
  res.send("Extra Copies Deleted Successfully");
});

router.put('/getbybatch', auth, async (req, res) => {
  const b = await Extra.find({batchcode:req.body.batchcode})
  if (!b) return res.status(404).send('The Extra Copies detail was not found.');
  res.send(b);
});
router.put('/Coord', auth, async (req, res) => {
  const b = await Extra.find({userid:req.body.userid, exam:req.body.exam})
  if (!b) return res.status(404).send('The Extra Copies detail was not found.');
  res.send(b);
});

router.put('/byexam',  async (req, res) => {
  const b = await Extra.find({exam:req.body.exam}).populate({path:'examinerid'});
  if (b.length === 0) return res.status(400).send('The Extra Copies detail was not found.');
  const coord = await User.find()
  const batch1 = b.map(e => {
    return {'batchcode':e.batchcode, 'ccode':e.ccode,'noofcopies':e.noofcopies,'coordinator':coord.find(e1 => e1._id.toString() === e.userid.toString()).name,'examiner':e.examinerid.name,'dteval':e.dteval, 'dtvmou':e.dtvmou,'copiesrecd':e.copiesrecd,'awlrecd':e.awlrecd}});
  res.send(batch1);
});


module.exports = router; 
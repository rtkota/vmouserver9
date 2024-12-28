const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const {Prcity} = require('../models/prcity'); 
const express = require('express');
const router = express.Router();

// For VMOU Exam
router.post('/',  async (req, res) => {
  const query = {"explace":req.body.explace};
  
  const rate1 = await Prcity.find(query);
  if (rate1.length>0) return res.status(400).send('Duplicate City Already Exists.');
  const rate2 = new Prcity(req.body);
  await rate2.save();
  
  res.send(rate2);
});

router.put('/',  async (req, res) => {
    const query = {"explace":req.body.explace};
    
    const rate1 = await Prcity.find(query);
    if (rate1.length===0) return res.status(400).send('City Not Found.');
    
    res.send(rate1);
});
router.get('/',  async (req, res) => {
    const rate1 = await Prcity.find();
    if (rate1.length===0) return res.status(400).send('City Not Found.');
    res.send(rate1);
});
router.put('/Coord/:uid',  [auth], async (req, res) => {
  let prcity = await Prcity.find({userid: req.params.uid });
  if (prcity.length === 0) return res.status(400).send('City NOT registered.');
  res.send(prcity);
});


module.exports = router;   

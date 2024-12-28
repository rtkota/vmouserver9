const validateObjectId = require('../middleware/validateObjectId');
const {Ratetable} = require('../models/ratetable'); 
const express = require('express');
const router = express.Router();

// For VMOU Exam
router.post('/',  async (req, res) => {
  const query = {"ccode":req.body.ccode};
  
  const rate1 = await Ratetable.find(query);
  if (rate1.length>0) return res.status(400).send('Duplicate Ccode / Ccode Already Exists.');
  const rate2 = new Ratetable(req.body);
  await rate2.save();
  
  res.send(rate2);
});

router.put('/',  async (req, res) => {
    const query = {"ccode":req.body.ccode};
    
    const rate1 = await Ratetable.find(query);
    if (rate1.length===0) return res.status(400).send('Ccode Not Found.');
    
    res.send(rate1);
});

module.exports = router;   

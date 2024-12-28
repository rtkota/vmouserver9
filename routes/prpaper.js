const {Prpaper} = require('../models/prpaper'); 
const express = require('express');
const router = express.Router();

// For VMOU Exam
router.post('/',  async (req, res) => {
  const query = {"ccode":req.body.ccode};
  
  const prpaper1 = await Prpaper.find(query);
  if (prpaper1.length>0) return res.status(400).send('Duplicate Ccode / Ccode Already Exists.');
  const prpaper2 = new Prpaper(req.body);
  await prpaper2.save();
  
  res.send(prpaper2);
});

router.put('/',  async (req, res) => {
    const query = {"ccode":req.body.ccode};
    
    const rate1 = await Prpaper.find(query);
    if (rate1.length===0) return res.status(400).send('Ccode Not Found.');
    
    res.send(rate1);
});
router.get('/',  async (req, res) => {
    const rate1 = await Prpaper.find().sort({ccode:1});
    if (rate1.length===0) return res.status(400).send('Ccode Not Found.');
    res.send(rate1);
});

module.exports = router;   

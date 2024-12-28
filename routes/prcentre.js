const auth = require('../middleware/auth');
const {Prcentre} = require('../models/prcentre');
const express = require('express');
const router = express.Router();

router.get('/:name', [auth], async (req, res) => {
  let prcentre = await Prcentre.findOne({ name: req.params.name });
  res.send(prcentre);
});

router.post('/', [auth], async (req, res) => {

  let prcentre1 = await Prcentre.findOne({ name: req.body.name });
  if (prcentre1) return res.status(400).send('Centre already registered.');
  const prcentre = new Prcentre(req.body);

  prcentre.status = 'Active';
  await prcentre.save();
  res.send(req.body);
});

router.put('/', [auth], async (req, res) => {
  const prcentre = await Prcentre.findOneAndUpdate({ name: req.body.name},
    { 
      prcity: req.body.prcity,
      phone: req.body.phone,
      userid:req.body.userid,
      contactperson: req.body.contactperson,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      status:'Active'
    }, { new: true });
  if (!prcentre) return res.status(404).send('The Centre with the given Name was not found.');
  res.send(prcentre);
});

router.get('/Coord/:uid',  [auth], async (req, res) => {
  let prcentre = await Prcentre.find({status:'Active', userid: req.params.uid }).populate({path:'prcity'});
  if (prcentre.length === 0) return res.status(400).send('Centres NOT registered.');
  res.send(prcentre);
});

router.put('/deactivate', [auth],async (req, res) => {
  let prcentre = await Prcentre.findOne({status:'Active', name: req.body.name });
  if (!prcentre) return res.status(400).send('Centre NOT registered.');
  prcentre.status='Deactivated';
  await prcentre.save();

  res.send(prcentre);
});

module.exports = router; 
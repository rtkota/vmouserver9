const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {Centre} = require('../models/centre');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/:eccode', [auth], async (req, res) => {
  let centre = await Centre.findOne({ eccode: req.params.eccode },{password:0});
  res.send(centre);
});

router.post('/', async (req, res) => {
  let centre1 = await Centre.findOne({ eccode: req.body.eccode });
  if (centre1) return res.status(400).send('centre already registered.');
  const centre = new Centre(req.body);

  const salt = await bcrypt.genSalt(10);
  centre.password = await bcrypt.hash('abcd1234', salt);
  centre.status = 'Active';
  centre.isFirst = true;
  await centre.save();
  res.send(req.body);
  //const token = centre.generateAuthToken();
  //res.header('x-auth-token', token).send(_.pick(centre, ['_id', 'empid','emailid','centrename','unitid','roleid','isAdmin']));
});

router.put('/', [auth], async (req, res) => {
  //const { error } = validatecentrePut(req.body); 
  //if (error) return res.status(400).send(error.details[0].message);
  const centre = await Centre.findOneAndUpdate({ eccode: req.body.eccode},
    { 
      phone: req.body.phone,
      explace:req.body.explace,
      name: req.body.name,
      email: req.body.email,
      status:'Active'
    }, { new: true });
  if (!centre) return res.status(404).send('The centre with the given ID was not found.');
  res.send(centre);
});

router.put('/pwd',  async (req, res) => {

  if (req.body.newpassword.length < 6) return res.status(400).send('Password TOO Short. Minimum length should be 6');
  let centre = await Centre.findOne({ status:'Active', eccode: req.body.eccode });
  if (!centre) return res.status(400).send('centre NOT registered.');
  const validPassword = await bcrypt.compare(req.body.password, centre.password);
  if (!validPassword) return res.status(400).send('Invalid  password.');
  const salt = await bcrypt.genSalt(10);
  const newpwd = await bcrypt.hash(req.body.newpassword, salt);
  const centre1 = await Centre.findOneAndUpdate({ status:'Active', eccode: req.body.eccode},
    { 
      password: newpwd,
      isFirst: false
    }, { new: true });
  if (!centre1) return res.status(404).send('The centre with the given ID was not found.');
  const token = centre1.generateAuthToken(); 
  let usr = {
    eccode:centre1.eccode,
    name:centre1.name,
    explace:centre1.explace,
    email:centre1.email,
    token:token,
    phone:centre1.phone,
    isFirst:centre1.isFirst,
  };
  res.send(usr);
});


router.put('/resetpwd',  async (req, res) => {
  let centre = await Centre.findOne({status:'Active', eccode: req.body.eccode });
  if (!centre) return res.status(400).send('centre NOT registered.');
  const salt = await bcrypt.genSalt(10);
  centre.password = await bcrypt.hash('abcd1234', salt);
  centre.isFirst=true;
  await centre.save();
  const token = centre.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(centre, ['_id', 'email','phone','name','eccode','explace']));
});

router.put('/deactivate', [auth],async (req, res) => {
  let centre = await Centre.findOne({status:'Active', eccode: req.body.eccode });
  if (!centre) return res.status(400).send('centre NOT registered.');
  centre.status='Deactivated';
  await centre.save();

  res.send(centre);
});


module.exports = router; 
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User} = require('../models/user');
const {Examiner} = require('../models/examiner');
const {Centre} = require('../models/centre');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  //if (error) return res.status(400).send(error.details[0].message+" xx");

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.-u');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  const usr = {
    userId:user._id,
    name:user.name,
    email:user.email,
    token:token
  };
  
  res.send(usr);
});
router.post('/examiner', async (req, res) => {
  const { error } = validate(req.body); 
  //if (error) return res.status(400).send(error.details[0].message+" xx");

  let examiner = await Examiner.findOne({ email: req.body.email });
  if (!examiner) return res.status(400).send('Invalid email or password.-u');

  const validPassword = await bcrypt.compare(req.body.password, examiner.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = examiner.generateAuthToken();
  const usr = {
    userId:examiner._id,
    name:examiner.name,
    email:examiner.email,
    token:token
  };
  

  res.send(usr);
});

router.post('/centre', async (req, res) => {
  //const { error } = validateCentre(req.body); 
  //if (error) return res.status(400).send(error.details[0].message+" xx");

  let centre = await Centre.findOne({ eccode: req.body.eccode });
  if (!centre) return res.status(400).send('Invalid Centre Code.');

  const validPassword = await bcrypt.compare(req.body.password, centre.password);
  if (!validPassword) return res.status(400).send('Invalid password.');

  const token = centre.generateAuthToken();
  const usr = {
    userId:centre._id,
    eccode:centre.eccode,
    name:centre.name,
    isFirst :centre.isFirst,
    token:token
  };
  res.send(usr);
});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(6).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 

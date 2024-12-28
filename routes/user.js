const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/:email', [auth], async (req, res) => {
  let user = await User.findOne({ email: req.params.email },{password:0});
  res.send(user);
});

router.get('/', async (req, res) => {
  const users = await User.find({},{name: 1, _id:1}).sort('name');
  res.send(users);
});

router.post('/', async (req, res) => {

  let user1 = await User.findOne({ email: req.body.email });
  if (user1) return res.status(400).send('Coordinator already registered.');
  const user = new User(req.body);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash('abcd1234', salt);
  user.isFirst = true;
  user.status = 'Active';
  await user.save();
  res.send(req.body);
  //const token = examiner.generateAuthToken();
  //res.header('x-auth-token', token).send(_.pick(examiner, ['_id', 'empid','emailid','examinername','unitid','roleid','isAdmin']));
});

router.put('/', [auth], async (req, res) => {
  //const { error } = validateexaminerPut(req.body); 
  //if (error) return res.status(400).send(error.details[0].message);
  const user = await User.findOneAndUpdate({ email: req.body.email},
    { 
      phone: req.body.phone,
      name: req.body.name
    }, { new: true });
  if (!user) return res.status(404).send('The Coordinator with the given ID was not found.');
  res.send(user);
});

router.put('/pwd',  async (req, res) => {

  if (req.body.newpassword.length < 6) return res.status(400).send('Password TOO Short. Minimum length should be 6');
  let user = await User.findOne({ status:'Active', email: req.body.email });
  if (!user) return res.status(400).send('Coordinator NOT registered.');
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid  password.');
  const salt = await bcrypt.genSalt(10);
  const newpwd = await bcrypt.hash(req.body.newpassword, salt);
  const user1 = await User.findOneAndUpdate({ email: req.body.email},
    { 
      password: newpwd,
      isFirst: false
    }, { new: true });
  if (!user1) return res.status(404).send('The Coordinator with the given ID was not found.');
  const token = user1.generateAuthToken(); 
  let usr = {
    email:user1.email,
    token:token,
    phone:user1.phone,
    isFirst:user1.isFirst,
    name:user1.name
  };
  res.send(usr);
});

router.put('/resetpwd',  async (req, res) => {
  let user = await User.findOne({email: req.body.email });
  if (!user) return res.status(400).send('Coordinator NOT registered.');
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash('abcd1234', salt);
  user.isFirst=true;
  await user.save();
  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'email','phone','name']));
});
module.exports = router; 
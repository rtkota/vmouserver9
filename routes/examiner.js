const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {Examiner} = require('../models/examiner');
const {Prcity} = require('../models/prcity');
const {Prpaper} = require('../models/prpaper');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/:email', [auth], async (req, res) => {
  let examiner = await Examiner.findOne({ email: req.params.email },{password:0});
  res.send(examiner);
});

router.post('/', async (req, res) => {

  let examiner1 = await Examiner.findOne({ email: req.body.email });
  if (examiner1) return res.status(400).send('examiner already registered.');
  const examiner = new Examiner(req.body);

  const salt = await bcrypt.genSalt(10);
  examiner.password = await bcrypt.hash('abcd1234', salt);
  examiner.status = 'Active';
  examiner.isFirst = true;
  await examiner.save();
  res.send(req.body);
  //const token = examiner.generateAuthToken();
  //res.header('x-auth-token', token).send(_.pick(examiner, ['_id', 'empid','emailid','examinername','unitid','roleid','isAdmin']));
});

router.put('/', [auth], async (req, res) => {
  //const { error } = validateexaminerPut(req.body); 
  //if (error) return res.status(400).send(error.details[0].message);
  const examiner = await Examiner.findOneAndUpdate({ email: req.body.email},
    { 
      phone: req.body.phone,
      userid:req.body.userid,
      name: req.body.name,
      bank: req.body.bank,
      branch: req.body.branch,
      accno: req.body.accno,
      ifsccode: req.body.ifsccode,
      panno: req.body.panno,
      status:'Active'
    }, { new: true });
  if (!examiner) return res.status(404).send('The examiner with the given ID was not found.');
  res.send(examiner);
});

router.put('/pwd',  async (req, res) => {

  if (req.body.newpassword.length < 6) return res.status(400).send('Password TOO Short. Minimum length should be 6');
  let examiner = await Examiner.findOne({ status:'Active', email: req.body.email });
  if (!examiner) return res.status(400).send('examiner NOT registered.');
  const validPassword = await bcrypt.compare(req.body.password, examiner.password);
  if (!validPassword) return res.status(400).send('Invalid  password.');
  const salt = await bcrypt.genSalt(10);
  const newpwd = await bcrypt.hash(req.body.newpassword, salt);
  const examiner1 = await Examiner.findOneAndUpdate({ status:'Active', email: req.body.email},
    { 
      password: newpwd,
      isFirst: false
    }, { new: true });
  if (!examiner1) return res.status(404).send('The examiner with the given ID was not found.');
  const token = examiner1.generateAuthToken(); 
  let usr = {
    examinerid:examiner1._id,
    userid:examiner.userid,
    email:examiner1.email,
    token:token,
    phone:examiner1.phone,
    isFirst:examiner1.isFirst,
    name:examiner1.name,
    bank:examiner1.bank,
    branch:examiner1.branch,
    accno:examiner1.accno,
    ifsccode:examiner1.ifsccode,
    panno:examiner1.panno
  };
  res.send(usr);
});

router.put('/prCoord/:uid',  async (req, res) => {
  let examiner = await Examiner.find({status:'Active', userid: req.params.uid },{password:0});
  // if (examiner.length === 0) return res.status(400).send('examiners NOT registered.');
  //res.send(_.pick(examiner, ['_id', 'userid','email','phone','name','bank','branch','accno','ifsccode','panno']));
  let prcity = await Prcity.find({userid: req.params.uid });
  if (prcity.length === 0) return res.status(400).send('City NOT registered.');
  let prpaper = await Prpaper.find().sort({ccode:1});
  if (prpaper.length === 0) return res.status(400).send('Papers NOT registered.');


  var sql = require("mssql");    
  // config for your database
  var config = {
      user: 'vmouexam',
      password: 'VM0u_3x@mjPE',
      server: '172.16.0.16', 
      database: 'vmouexam',
      encrypt: false
  };

      // connect to your database
  sql.connect(config, async function (err) {
    if (err) {   
        console.log("Error while connecting database :- " + err);
        res.send(err);
    }
    else {   
      var request = new sql.Request();
      const cs = "SELECT ccode,explace,count(*) as nos FROM result where (batchno is null or batchno=0) and exam='" + req.body.exam + "' and ptype ='PR' group by ccode,explace"
      const x = await request.query(cs)
      res.send({'examiners':examiner,'prcities':prcity,'prpapers':prpaper,'papercity':x.recordset});
    }
  });
});


router.get('/Coord/:uid',  async (req, res) => {
  let examiner = await Examiner.find({status:'Active', userid: req.params.uid },{password:0});
  if (examiner.length === 0) return res.status(400).send('examiners NOT registered.');
  //res.send(_.pick(examiner, ['_id', 'userid','email','phone','name','bank','branch','accno','ifsccode','panno']));
  res.send(examiner);
});
router.put('/resetpwd',  async (req, res) => {
  let examiner = await Examiner.findOne({status:'Active', email: req.body.email });
  if (!examiner) return res.status(400).send('examiner NOT registered.');
  const salt = await bcrypt.genSalt(10);
  examiner.password = await bcrypt.hash('abcd1234', salt);
  examiner.isFirst=true;
  await examiner.save();
  const token = examiner.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(examiner, ['_id', 'email','phone','name','bank','branch','accno','ifsccode','panno']));
});

router.put('/deactivate', [auth],async (req, res) => {
  let examiner = await Examiner.findOne({status:'Active', email: req.body.email });
  if (!examiner) return res.status(400).send('examiner NOT registered.');
  examiner.status='Deactivated';
  await examiner.save();

  res.send(examiner);
});


module.exports = router; 
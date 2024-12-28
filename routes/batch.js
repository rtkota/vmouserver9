const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const {Batch, validate, validateCreate,validateMarks} = require('../models/batch'); 
const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const mongoose = require('mongoose');

// For VMOU Exam
router.put('/batchcode',  async (req, res) => { 
  const query = {"batchcode":req.body.batchcode};
  const batch = await Batch.findOne(query).populate({path:'examinerid'});
  if (!batch) return res.status(400).send('Batch Not Found.');
  abs = batch.marks.filter(x => (x.status.trim().toUpperCase()==='AB')).length;
  res.send({'userid':batch.userid, 'status':batch.status, 'totalCopies':batch.totalcopies, 'absentee':abs,'invalid':batch.invalid.length, 'examiner':batch.examinerid.name, 'type':batch.type});
  //res.send({'userid':batch.userid,'ccode':batch.ccode, 'batchcode':batch.batchcode, 'totalCopies':batch.totalcopies, 'absentee':0, 'status':batch.status, 'marks':batch.marks});
});

router.post('/',  async (req, res) => {
  //const { error } = validateCreate(req.body); 
  //if (error) return res.status(400).send("Validation Error");
  const query = {"batchcode":req.body.batchcode};
  const batch1 = await Batch.find(query);
  if (batch1.length>0) return res.status(400).send('Duplicate Batch / Batch Already Exists.');
  const batch = new Batch(req.body);
  await batch.save();
  
  res.send(batch);
});

router.put('/getmarks', async (req, res) => { 
  const batch = await Batch.aggregate([
    {$match: {exam:req.body.exam,ccode:req.body.ccode,"marks.controlno":req.body.schno,"status":'posted'}},
    {
      $project: {
         marks: {
            $filter: {
               input: "$marks",
               as: "mark",
               cond: { $eq: [ "$$mark.controlno", req.body.schno ] }
            }
         }
      }
   }]); 
   if (!batch) return res.status(400).send('No  Batch Found.');
   res.send({"batch":batch.batchcode,"marks":batch[0].marks});
});

router.put('/getmarks1', async (req, res) => { 
  const batch = await Batch.aggregate([
    {$match: {exam:req.body.exam,ccode:req.body.ccode,"marks.controlno":req.body.schno,"status":'posted'}},
    {
      $project: {
         batchcode:1,
         marks: {
            $filter: {
               input: "$marks",
               as: "mark",
               cond: { $eq: [ "$$mark.controlno", req.body.schno ] }
            }
         }
      }
   }]); 
   if (!batch) return res.status(400).send('No  Batch Found.');
   const query = {"batchcode":batch[0].batchcode};
   const batch1 = await Batch.findOne(query).populate({path:'examinerid'});
   res.send({'userid':batch1.userid, 'status':batch1.status,'examiner':batch1.examinerid.name,"batch":batch[0].batchcode,"marks":batch[0].marks[0].award.toString()});
});

router.put('/getadvmarks', async (req, res) => { 
  const batch = await Batch.aggregate([
    {$match: {exam:req.body.exam,ccode:req.body.ccode,"marks.controlno":req.body.schno}},
    {
      $project: {
         marks: {
            $filter: {
               input: "$marks",
               as: "mark",
               cond: { $eq: [ "$$mark.controlno", req.body.schno ] }
            }
         }
      }
   }]); 
   res.send(batch[0].marks);
});

router.post('/newPractical',async (req, res)=> {
  let schnos=[]
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
      const cs = "SELECT schno FROM result where omarks=0 and ptype='PR' and (batchno is null or batchno=0) and exam='" + req.body.exam + "' and ccode='" + req.body.course + "' and explace='" + req.body.city + "' order by schno"
      request.query(cs, async function (err, recordset) {      
        if (err) {
            console.log("Error while selecting schnos from result table :- " + err);
            res.send(err);
        }
        else {
          recordset.recordset.forEach(element => {
            schnos.push(element.schno)
          });
          // get batch code
          const cs1="select top(1) * from result as r,examccode as e where  r.exam=e.exam and r.ccode=e.ccode and ptype='PR' and r.exam='"+req.body.exam+"' and r.ccode='"+req.body.course+"' order by batchno desc"
          request.query(cs1, async function (err, recordset1) {      
            if (err) {
                console.log("Error while getting batchcode from database :- " + err);
                res.send(err);
            }
            else {  
              let batch=1
              let marks=[]
              let bno1 = !recordset1.recordset[0].batchno?0:recordset1.recordset[0].batchno
              let bno=""
              for(let i=0;i<schnos.length;i++){
                if (i>=(batch*req.body.batchsize)) {
                  const marksb = marks.map(e => {
                    return  ({controlno:e, award:0, status:'Ab'})
                  })
                  bno1=bno1+1
                  bno=recordset1.recordset[0].exrno.toString() + "-" + bno1.toString()                  
                  let pbatch = new Batch()
                  pbatch.userid = req.body.userid
                  pbatch.ccode = req.body.course
                  pbatch.totalcopies=marksb.length
                  pbatch.exam = req.body.exam
                  pbatch.prcity = req.body.city
                  pbatch.mmarks = req.body.mmarks
                  pbatch.type = 'pract1'
                  pbatch.bundles = 1
                  pbatch.attempts = 0
                  pbatch.dtcreated = new Date()
                  pbatch.status = 'created'
                  pbatch.batchcode = bno
                  pbatch.marks = marksb
                  let pc = ""
                  let j = 0
                  marks.forEach(e => {
                    if (j === 0)
                        pc = "'" + e + "'"
                    else
                        pc = pc + "," + "'" + e + "'"
                    j = j + 1
                  })
                  const cs2="update result set batchno=" + bno1 + " where omarks=0 and ptype='PR' and exam='"+req.body.exam+"' and ccode='"+req.body.course + "' and schno in (" + pc + ")"
                  const x = await request.query(cs2)
                      batch=batch+1
                      marks.splice(0,marks.length)
                      marksb.splice(0,marksb.length)
                      await pbatch.save()
                }
                marks.push(schnos[i])
              }
              if (marks.length>0) {
                let marksb = marks.map(e => {
                  return  ({controlno:e, award:0, status:'Ab'})
                })
                bno1=bno1+1
                bno=recordset1.recordset[0].exrno.toString() + "-"+bno1.toString()                  
                let pbatch = new Batch()
                pbatch.userid = req.body.userid
                pbatch.ccode = req.body.course
                pbatch.mmarks = req.body.mmarks
                pbatch.prcity = req.body.city
                pbatch.totalcopies=marksb.length
                pbatch.exam = req.body.exam
                pbatch.type = 'pract1'
                pbatch.bundles = 1
                pbatch.attempts = 0
                pbatch.dtcreated = new Date()
                pbatch.status = 'created'
                pbatch.batchcode = bno
                pbatch.marks = marksb
                let pc = ""
                let j = 0
                marks.forEach(e => {
                  if (j === 0)
                      pc = "'" + e + "'"
                  else
                      pc = pc + "," + "'" + e + "'"
                  j = j + 1
                })
                const cs2="update result set batchno=" + bno1 + " where omarks=0 and ptype='PR' and exam='"+req.body.exam+"' and ccode='"+req.body.course + "' and schno in (" + pc + ")"
                await request.query(cs2)
                batch=batch+1
                marks.splice(0,marks.length)
                await pbatch.save()
              }
              res.send(recordset);
            }
          });  
        }    
      });
    }
  });
})

router.post('/unalloc', async (req, res) => { 
  let batch=[];
  batch = await Batch.find({exam:req.body.exam,ccode:req.body.ccode}).sort({ccode:1});
 
  if (batch.length === 0) return res.status(400).send('No Unallocated Batch Found.');
  const batch1 = batch.map(e => {
    return {'batchcode':e.batchcode, 'totalCopies':e.totalcopies,'bundles':e.bundles,'marks':e.marks}});
    res.send(batch1);
});

router.post('/unassign', async (req, res) => { 
  let batch=[];
  batch = await Batch.find({exam:req.body.exam,ccode:req.body.ccode, examinerid: null}).sort({ccode:1});
 
  if (batch.length === 0) return res.status(400).send('No Unassigned Batch Found.');
  const batch1 = batch.map(e => {
    return {'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'userid':e.userid}});
    res.send(batch1);
});
router.post('/report', async (req, res) => { 
  let batch=[];
  //let abs=0;
  if (req.body.ccode === 'ALL' && req.body.userid === "ALL")
    batch = await Batch.find({exam:req.body.exam}).sort({ccode:1}).populate({path:'examinerid'});
  else if (req.body.ccode === 'ALL' && req.body.userid !== "ALL")
      batch = await Batch.find({exam:req.body.exam, userid: req.body.userid}).sort({ccode:1}).populate({path:'examinerid'});
  else if (req.body.ccode !== 'ALL' && req.body.userid === "ALL")
      batch = await Batch.find({exam:req.body.exam, ccode: req.body.ccode}).sort({ccode:1}).populate({path:'examinerid'});
  else
      batch = await Batch.find({exam:req.body.exam, ccode: req.body.ccode, userid: req.body.userid}).sort({ccode:1}).populate({path:'examinerid'});

  if (batch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = batch.map(e => {
    const abs = e.marks.filter(x => (x.status.trim().toUpperCase()==='AB')).length;
    return {'ccode':e.ccode, 'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'userid':e.userid, 'status':e.status, 'dtcreated':e.dtcreated, 'dtsend':e.dtsend, 'dtsubmitted':e.dtsubmitted, 'dtrecd':e.dtrecd,'absentee':abs,'invalid':e.invalid?e.invalid.length:0,'examiner':e.examinerid?e.examinerid.name:''}});
  res.send(batch1);
});


router.post('/pendingreport', async (req, res) => { 
  let nbatch=[];  
  nbatch = await Batch.find({exam:req.body.exam, userid: {$exists:true}, dtrecd: {$exists:false}}).populate({path:'examinerid'}).sort({ccode:1});
  if (nbatch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = nbatch.map(e => {
    return {'ccode':e.ccode, 'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'username':e.userid, 'status':e.status,  'dtsend':e.dtsend, 'dtsubmitted':e.dtsubmitted, 'examinername':typeof e.examinerid !== 'undefined'?e.examinerid.name:''}});
  res.send(batch1);
});
router.post('/checkpending', async (req, res) => { 
  let nbatch=[];  
  nbatch = await Batch.find({exam:req.body.exam, ccode:req.body.ccode, userid: {$exists:true}, dtrecd: {$exists:false}});
  if (nbatch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = nbatch.map(e => {
    return {'ccode':e.ccode, 'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'username':e.userid, 'status':e.status,  'dtsend':e.dtsend, 'dtsubmitted':e.dtsubmitted, 'examinername':typeof e.examinerid !== 'undefined'?e.examinerid.name:''}});
  res.send(batch1);
});


router.post('/invalidReport', async (req, res) => { 
  let batch=[];
  let i=0;
  let inv=[];
  batch = await Batch.find({status: {$in: ['posted']}, exam:req.body.exam, invalid: {$exists: true}});
  if (batch.length === 0) return res.status(400).send('No  Batch Found.');
  batch.map(e => {
    for (i=0;i<e.invalid.length;i++) {
      inv.push({'ccode':e.ccode, 'batch':e.batchcode,'copyno':e.invalid[i].copyno,'controlno':e.invalid[i].controlno,'marks':e.invalid[i].marks,'dtsubmitted':e.dtsubmitted})
    }
  });
  res.send(inv);
});

router.post('/posting', async (req, res) => { 
  let batch=[];
  //batch = await Batch.find({exam:req.body.exam, status: {$in: ['submitted','billed']}}).sort({ccode:1});
  batch = await Batch.find({exam:req.body.exam, status:{$ne:'posted'}, dtrecd : {$exists:true}}).sort({ccode:1});

  if (batch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = batch.map(e => {
    absent = e.marks.filter(x => (x.status.trim().toUpperCase()==='AB')).length;
    return {'ccode':e.ccode, 'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'absentee':absent.length, 'status':e.status, 'marks':e.marks}});
    res.send(batch1);
});

router.post('/prposting', async (req, res) => { 
  let batch=[];
  //batch = await Batch.find({exam:req.body.exam, status: {$in: ['submitted','billed']}}).sort({ccode:1});
  batch = await Batch.find({type:'pract1',exam:req.body.exam, status:{$nin:['created','posted']}}).sort({ccode:1});

  if (batch.length === 0) return res.status(400).send('No  Batch Found.');
  const batch1 = batch.map(e => {
    absent = e.marks.filter(x => (x.status.trim().toUpperCase()==='AB')).length;
    return {'ccode':e.ccode, 'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'absentee':absent.length, 'status':e.status, 'marks':e.marks}});
    res.send(batch1);
});
router.put('/batchpost/', async (req, res) => {
  const j = await Batch.updateMany({batchcode: {$in: req.body.batchcode}},
  {
    $set :{status:'posted'}
  }, { new: true });
  res.send("Success");
});

router.put('/changeStatus/', async (req, res) => {
  const j = await Batch.updateOne({batchcode: req.body.batchcode},
  {
    $set :{status:'created'}
  }, { new: true });
  res.send("Success");
});


router.put('/alloc/', async (req, res) => {
  // let i=0;
  // for (i=0;i<req.body.length;i++) {
    
  //   const j = await Batch.updateOne({'batchcode':req.body[i].batchcode},
  //     {
  //       $set :{userid:req.body[i].userid, dtcreated: new Date(req.body[i].dtcreated)}
  //     }, { new: true });
  //   }
    let i=0;
    for (i=0;i<req.body.length;i++) {
      const batch = new Batch(req.body[i]);
      await batch.save();
    }
    res.send("Success");
});

router.put('/allocone/', async (req, res) => {
  const j = await Batch.updateOne({'batchcode':req.body.batchcode},
  {
    $set :{userid:req.body.userid}
  }, { new: true });
  res.send("Success");
});

router.put('/bdelete', async (req, res) => { 
  const b = await Batch.findOneAndRemove({batchcode:req.body.batchcode})
  res.send("Batch Deleted Successfully");
});

router.put('/ack', async (req, res) => { 
   let batch=[];
  batch = await Batch.find({exam:req.body.exam,userid:req.body.userid}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No Batch Allocated to this Coordinator Found.');
  //const batch1 = batch.map(e => {
  //  return {'ccode':e.ccode,'batchcode':e.batchcode, 'totalCopies':e.totalcopies,'dtcreated':e.dtcreated}});
    res.send(batch);
});

router.put('/ExaminerReport', async (req, res) => { 
  let batch=[];
  batch = await Batch.find({exam:req.body.exam,userid:req.body.userid}).populate({path:'examinerid'}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No '+req.body.sts+' Batch Found.');
  const batch1 = batch.map(e => {
    const abs = e.marks.filter(x => (x.status.trim().toUpperCase()==='AB')).length;
    return {'ccode':e.ccode, 'batchcode':e.batchcode, 'totalCopies':e.totalcopies, 'userid':e.userid, 'status':e.status, 'dtcreated':e.dtcreated, 'dtsend':e.dtsend, 'dtsubmitted':e.dtsubmitted, 'dtrecd':e.dtrecd,'absentee':abs,'invalid':e.invalid?e.invalid.length:0,'examiner':e.examinerid?e.examinerid.name:''}});
  res.send(batch1);
});

// For Coordinators

router.put('/send/', auth, async (req, res) => {
  const b = await Batch.findOne({batchcode:req.body.batchcode})
  if (!b) return res.status(400).send('Batch Not  Found.');
  if (b.status !== 'created') return res.status(400).send('Batch Already Submitted.');
  const j = await Batch.updateOne({'batchcode':req.body.batchcode, 'status':'created'},
  {
    $set :{examinerid:req.body.examinerid, dtsend:req.body.dtsend}
  }, { new: true });
  res.send("Success");
});

router.put('/recd/', auth, async (req, res) => {
  const b = await Batch.findOne({batchcode:req.body.batchcode})
  if (!b) return res.status(400).send('Batch Not  Found.');
  if (b.status === 'created') return res.status(400).send('Batch Not Submitted.');
  if (b.status === 'posted') return res.status(400).send('Batch Already Recd and Posted.');
  const j = await Batch.updateOne({'batchcode':req.body.batchcode},
  {
    $set :{dtrecd:req.body.dtrecd}
  }, { new: true });
  res.send("Success");
});

router.put('/prCoord', auth, async (req, res) => { 
  let batch=[];
  if (req.body.sts === 'Unassigned') {
    if (!req.body.ccode && !req.body.city) {
      batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, examinerid:{$exists:false}}).populate({path:'examinerid'}).sort({ccode:1});
    } else {
      console.log(req.body.city)
      if (req.body.ccode && req.body.city) {
        batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, ccode:req.body.ccode, prcity:req.body.city,examinerid:{$exists:false}}).populate({path:'examinerid'}).sort({batchcode:1});
      }
        else {
        if (req.body.ccode)
          batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, ccode:req.body.ccode, examinerid:{$exists:false}}).populate({path:'examinerid'}).sort({ccode:1});
        else
          batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, prcity:req.body.city, examinerid:{$exists:false}}).populate({path:'examinerid'}).sort({ccode:1});
      }
    }
    // batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, examinerid:{$exists:false}}).populate({path:'examinerid'}).sort({ccode:1});
  } else {
    if (req.body.sts === 'Assigned') {
      if (!req.body.ccode && !req.body.city) {
        batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, examinerid:{$exists:true}}).populate({path:'examinerid'}).sort({ccode:1});
      } else {
        if (req.body.ccode && req.body.city)
          batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, ccode:req.body.ccode, prcity:req.body.city,examinerid:{$exists:true}}).populate({path:'examinerid'}).sort({ccode:1});
        else {
          if (req.body.ccode)
            batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, ccode:req.body.ccode, examinerid:{$exists:true}}).populate({path:'examinerid'}).sort({ccode:1});
          else
            batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, prcity:req.body.city, examinerid:{$exists:true}}).populate({path:'examinerid'}).sort({ccode:1});
        }
      }
    }
    else {
      if (!req.body.ccode && !req.body.city) {
        batch = await Batch.find({exam:req.body.exam,userid:req.body.userid}).populate({path:'examinerid'}).sort({ccode:1});
      } else {
        if (req.body.ccode && req.body.city)
          batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, ccode:req.body.ccode, prcity:req.body.city}).populate({path:'examinerid'}).sort({ccode:1});
        else {
          if (req.body.ccode)
            batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, ccode:req.body.ccode}).populate({path:'examinerid'}).sort({ccode:1});
          else
            batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, prcity:req.body.city}).populate({path:'examinerid'}).sort({ccode:1});
        }
      }
    }
  }
  if (batch.length === 0) return res.status(400).send('No '+req.body.sts+' Batch Found.');
    res.send(batch);
});

router.put('/Coord', auth, async (req, res) => { 
  let batch=[];
  if (req.body.sts === 'Unassigned')
    batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, examinerid:{$exists:false}}).populate({path:'examinerid'}).sort({ccode:1});
  else
    if (req.body.sts === 'Assigned')
      batch = await Batch.find({exam:req.body.exam,userid:req.body.userid, examinerid:{$exists:true}}).populate({path:'examinerid'}).sort({ccode:1});
    else
      batch = await Batch.find({exam:req.body.exam,userid:req.body.userid}).populate({path:'examinerid'}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No '+req.body.sts+' Batch Found.');
    res.send(batch);
});
//Examiner

router.put('/Examiner', auth, async (req, res) => { 
  let batch=[];
  if (req.body.sts === 'Pending')
    batch = await Batch.find({exam:req.body.exam,examinerid:req.body.examinerid, status:'created'}).populate({path:'examinerid'}).sort({ccode:1});
  else
    if (req.body.sts === 'Submitted')
      batch = await Batch.find({exam:req.body.exam,examinerid:req.body.examinerid, status: {$in: ['submitted','posted']}}).populate({path:'examinerid'}).sort({ccode:1});
    else
      if (req.body.sts === 'Billed')
        batch = await Batch.find({exam:req.body.exam,examinerid:req.body.examinerid, status:'billed'}).populate({path:'examinerid'}).sort({ccode:1});
      else
        batch = await Batch.find({exam:req.body.exam,examinerid:req.body.examinerid}).populate({path:'examinerid'}).sort({ccode:1});
  if (batch.length === 0) return res.status(400).send('No '+req.body.sts+' Batch Found.');
  res.send(batch);
});

router.put('/citychange', auth, async (req, res) => { 
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
      const cs = "SELECT schno,explace FROM result where ptype ='PR' and exam='" + req.body.exam + "' and ccode='" + req.body.ccode + "' and explace='" + req.body.city + "' order by schno"
      const x = await request.query(cs)
      res.send(x.recordset);
    }
  });
});

router.put('/prCityChange', auth, async (req, res) => { 
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
      for(let i=0;i<req.body.batch.length;i++) {
        const sx = await Promise.all(req.body.batch.map(async (e) => {
          const cs = "update result set explace = '" + e.explace + "' where ptype ='PR' and exam='" + req.body.exam + "' and ccode='" + req.body.ccode + "' and schno='" + e.schno + "'"
          const x = await request.query(cs)
        }
        ))
      }
      res.send("Success")
    }
  });
});

// router.get('/user/:uid', auth, async (req, res) => {
//   const query = {"userid":req.params.uid, "status":"created"};
//   const batches = await Batch.find(query).sort('userid');
//   var batcharray = batches.filter(function(b, index, arr){ return b.attempts < 10;});
//   res.send(batcharray);
// });

router.get('/:bcd', auth, async (req, res) => { 
  const query = {"batchcode":req.params.bcd};
  const batch = await Batch.findOne(query);
  if (!batch) return res.status(400).send('Batch Not Found.');
  res.send(batch);
});

router.put('/save/:id', [auth, validateObjectId], async (req, res) => {
  // const { error } = validateMarks(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);
  const b1 = await Batch.findById(req.params.id);
  let attempts = 0;
  if (b1) attempts = b1.attempts||0;
  if (attempts >= 100)  return res.status(404).send('The No of attempts to save the batch exceeds the limit.');
  const batch = await Batch.findByIdAndUpdate(req.params.id,
    { 
      marks: req.body.marks,
      status: req.body.status,
      attempts: attempts + 1
    }, { new: true });
  if (!batch) return res.status(404).send('The batch with the given ID was not found.');
  
  res.send(batch);
});

router.put('/submit/:id', [auth, validateObjectId], async (req, res) => {
  // const { error } = validateMarks(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);

  const batch = await Batch.findByIdAndUpdate(req.params.id,
    { 
      marks: req.body.marks,
      status: 'submitted',
      dtsubmitted: Date.now()
    }, { new: true });

  if (!batch) return res.status(404).send('The batch with the given ID was not found.');
  
  res.send(batch);
});

router.put('/invalid/:id', [auth, validateObjectId], async (req, res) => {
  // const { error } = validateMarks(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);
  const batch = await Batch.findById(req.params.id);
  let invalid=[];
  if (batch) invalid = batch.invalid;
  const i = invalid.find(x => x.copyno === req.body.copyno);
  if (i) invalid[i] = req.body;
  const batch1 = await Batch.findByIdAndUpdate(req.params.id,
    { 
      invalid: invalid,
    }, { new: true });
  if (!batch1) return res.status(404).send('The batch with the given ID was not found.');
  
  res.send(batch1.invalid);
});

router.put('/deleteinvalid/:id', [auth, validateObjectId], async (req, res) => {
  // const { error } = validateMarks(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);
  const batch = await Batch.findById(req.params.id);
  let invalid=[];
  if (batch) invalid = batch.invalid;
  let newinvalid = invalid.filter(val => val.copyno !== req.body.copyno);
  const batch1 = await Batch.findByIdAndUpdate(req.params.id,
    { 
      invalid: newinvalid,
    }, { new: true });
  if (!batch1) return res.status(404).send('The batch with the given ID was not found.');
  res.send(batch1.invalid);
});

router.post('/invalid/:id', [auth, validateObjectId], async (req, res) => {
  // const { error } = validateMarks(req.body); 
  // if (error) return res.status(400).send(error.details[0].message);
  const batch = await Batch.findById(req.params.id);
  let invalid=[];
  if (batch && batch.invalid) invalid = batch.invalid;
  invalid.push(req.body);
  const batch1 = await Batch.findByIdAndUpdate(req.params.id,
    { 
      invalid: invalid,
    }, { new: true });
  if (!batch1) return res.status(404).send('The batch with the given ID was not found.');
  
  res.send(batch1.invalid);
});


module.exports = router; 
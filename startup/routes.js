const express = require('express');
const centre = require('../routes/centre');
const prcentre = require('../routes/prcentre');
const prpaper = require('../routes/prpaper');
const prcity = require('../routes/prcity');
const absentee = require('../routes/absentee');
const um = require('../routes/um');
const addl = require('../routes/addl');
const extra = require('../routes/extra');
const ratetable = require('../routes/ratetable');
const bill = require('../routes/bill');
const batch = require('../routes/batch');
const examiner = require('../routes/examiner');
const user = require('../routes/user');
const auth = require('../routes/auth');
const oneview = require('../routes/oneview')
const asquestion = require('../routes/asquestion')
const error = require('../middleware/error');

module.exports = function(app) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Origin,X-Requested-With, Content-Type, Accept, x-auth-token");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS")
    next();
  });
  app.use(express.json({limit: '50mb'}));
  app.use('/api/prcity', prcity);
  app.use('/api/prpaper', prpaper);
  app.use('/api/prcentre', prcentre);
  app.use('/api/centre', centre);
  app.use('/api/absentee', absentee);
  app.use('/api/addl', addl);
  app.use('/api/um', um);
  app.use('/api/extra', extra);
  app.use('/api/ratetable', ratetable);
  app.use('/api/bill', bill);
  app.use('/api/batch', batch);
  app.use('/api/examiner', examiner);
  app.use('/api/user', user);
  app.use('/api/auth', auth);
  app.use('/api/oneview',oneview);
  app.use('/api/asquestion',asquestion)

  app.use(error);
}
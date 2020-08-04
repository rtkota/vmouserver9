const express = require('express');
const batch = require('../routes/batch');
const users = require('../routes/users');
const auth = require('../routes/auth');
const oneview = require('../routes/oneview')
const error = require('../middleware/error');


module.exports = function(app) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Origin,X-Requested-With, Content-Type, Accept, x-auth-token");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS")
    next();
  });
  app.use(express.json());
  app.use('/api/batch', batch);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/oneview',oneview);

  app.use(error);
}
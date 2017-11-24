'use strict';

// Refer: https://qiita.com/AkihiroTakamura/items/ac4f1d3ec32effdd63d2

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config/index');

var User = require('../models/user');


router.get('/setup', function(req, res) {
  var demo = new User({
    name: 'demouser',
    password: 'password'
  });

  demo.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true});
  });
});


router.post('/authenticate', function(req, res) {
  // find db by posted email
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    // validation
    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
      return;
    }

    if (user.password != req.body.password) {
      res.json({
        success: false,
        message: 'Authentication failed. Wrong password.'
      });
      return;
    }

    // when valid -> create token
    var token = jwt.sign(user, app.get('superSecret'), {
      expiresIn: '24h'
    });

    res.json({
      success: true,
      message: 'Authentication successfully finished.',
      token: token
    });
  });
});


// Authentification Filter
router.use(function(req, res, next) {
  // get token from body:token or query:token of Http Header:x-access-token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // validate token
  if (!token) {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }

  jwt.verify(token, config.JWT_SECRET, function(err, decoded) {
    if (err) {
      return res.json({
        success: false,
        message: 'Invalid token'
      });
    }

    // if token valid -> save token to request for use in other routes
    req.decoded = decoded;
    next();
  });
});


// secure api --------


router.get('/', function(req, res) {
  res.json({ message: 'Welcome to API routing'});
});

router.get('/users', function(req, res) {
  //User.find({}, function(err, users) {
  User.count({}, function(err, users) {
    if (err) throw err;
    res.json(users);
  });
});


module.exports = router;


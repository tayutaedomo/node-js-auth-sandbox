'use strict';

// Refer: https://qiita.com/AkihiroTakamura/items/ac4f1d3ec32effdd63d2

var debug = require('debug')('node-js-auth-sandbox:routes:express_jwt');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config/index');
const passportConf = require('./passport');
const helpers = require('../helpers/controller_helpers');

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


router.post('/authenticate', async function(req, res) {
  debug('authenticate', req.body);

  // find db by posted email
  // User.findOne({
  //   email: req.body.email
  // }, function(err, user) {
  //   if (err) throw err;
  //
  //   // validation
  //   if (!user) {
  //     res.json({
  //       success: false,
  //       message: 'Authentication failed. User not found.'
  //     });
  //     return;
  //   }
  //
  //   if (user.password != req.body.password) {
  //     res.json({
  //       success: false,
  //       message: 'Authentication failed. Wrong password.'
  //     });
  //     return;
  //   }
  //
  //   // when valid -> create token
  //   var token = jwt.sign(user, config.JWT_SECRET, {
  //     expiresIn: '24h'
  //   });
  //
  //   res.json({
  //     success: true,
  //     message: 'Authentication successfully finished.',
  //     token: token
  //   });
  // });

  try {
    const user = await User.findOne({ email: req.body.email });

    // validation
    if (! user) {
      throw new Error('Authentication failed. User not found.');
    }

    const isMatch = await user.isValidPassword(req.body.password);

    if (! isMatch) {
      throw new Error('Authentication failed. Wrong password.');
    }

    // when valid -> create token
    var token = helpers.signToken(user);

    res.json({
      success: true,
      message: 'Authentication successfully finished.',
      token: token
    });

  } catch (error) {
    debug(error.stack);

    res.json({
      success: false,
      message: error.message
    });
  }
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

//
// secure api --------
//

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to API routing'});
});

router.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    debug('users', users);

    if (err) throw err;
    res.json(users.length);
  });
});


module.exports = router;


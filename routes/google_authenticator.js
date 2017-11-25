'use strict';

// Refer: https://davidwalsh.name/2fa

var express = require('express');
var router = express.Router();
const debug = require('debug')('node-js-auth-sandbox:routes:google_authenticator');
const _ = require('underscore');
const async = require('async');
const passport = require('passport');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const helpers = require('../helpers/controller_helpers');


router.post('/login', passport.authenticate('local', { session: false }), function(req, res, next) {
  var payload = {
    title: 'Logged in' + ' | Google Authenticator',
    data: {},
    secret: null
  };

  if (req.user) {
    payload.data.user = req.user;

  } else {
    res.render('google_authenticator/two_factor_auth', payload);
    return;
  }

  payload.data.token = helpers.signToken(req.user);

  async.waterfall([
    function(callback) {
      if (! _.isEmpty(req.user.gaTempSecret)) {
        callback();
        return;
      }

      payload.secret = speakeasy.generateSecret({ length: 20 });
      debug('secret.base32', payload.secret.base32); // Save this value to your DB for the user

      req.user.gaTempSecret = payload.secret.base32;
      req.user.gaOtpauthUrl = payload.secret.otpauth_url;

      req.user.save(function(err) {
        callback(err);
      });
    },
    function(callback) {
      if (_.isEmpty(payload.secret)) {
        callback();
        return;
      }

      QRCode.toDataURL(payload.secret.otpauth_url, function(err, data) {
        debug('QRCode.toDataURL', data);
        payload.data.dataUrl = data;
        callback(err);
      });
    }
  ], function(err) {
    if (err) console.err(err.stack);

    res.render('google_authenticator/two_factor_auth', payload);
  });
});

router.post('/verify', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  var payload = {
    title: 'Verify' + ' | Google Authenticator',
    data: {}
  };

  if (req.user) {
    payload.data.user = req.user;

  } else {
    res.render('google_authenticator/two_factor_auth', payload);
    return;
  }

  async.waterfall([
    function(callback) {
      payload.data.verified = speakeasy.totp.verify({
        secret: req.user.gaTempSecret,
        encoding: 'base32',
        token: req.body.user_token
      });

      if (! payload.data.verified) {
        callback();
        return;
      }

      req.user.gaSecret = req.user.gaTempSecret;
      req.user.gaTempSecret = null;
      req.user.gaEnabled = true;

      req.user.save(function(err) {
        callback(err);
      });
    }
  ], function(err) {
    if (err) console.err(err.stack);

    res.render('google_authenticator/two_factor_auth', payload);
  });
});

router.get('/:view', function(req, res, next) {
  var payload = {
    title: req.params.view + ' | Google Authenticator',
    data: {}
  };
  res.render('google_authenticator/' + req.params.view, payload);
});


module.exports = router;


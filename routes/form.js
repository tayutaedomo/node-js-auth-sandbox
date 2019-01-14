'use strict';

const debug = require('debug')('node-js-auth-sandbox:routes:form');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');

const { validateBody, schemas } = require('../helpers/route_helpers');
const User = require('../models/user');


router.get('/signup', function(req, res) {
  res.cookie('cookie_secure_try', 'Yes', {
    expires: new Date(Date.now() + 900000),
    //httpOnly: true,
    secure: true
  });

  res.render('form/signup', {
    title : 'Sign up Form',
    data: { params: {} }
  });
});

router.post('/signup', function(req, res) {
  const payload = {
    title : 'Sign up Form',
    data: { params: {} }
  };

  const result = Joi.validate(req.body, schemas.authSchema);

  if (result.error) {
    payload.data.result = result;
    return res.render('form/signup', payload);
  }

  (async function() {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      payload.data.result = { error: 'Email is already in use' };
      return res.render('form/signup', payload);
    }

    const newUser = new User({ email, password });
    await newUser.save();

    payload.data.result = 'User created.';

    res.render('form/signup', payload);
  })();
});


router.get('/login', function(req, res) {
  debug('login get', req.user);

  res.render('form/login', {
    title : 'Login Form',
    data: {
      params: {},
      user: req.user
    }
  });
});

router.post('/login', function(req, res, next) {
  const payload = {
    title : 'Login Form',
    data: { params: {} }
  };

  const result = Joi.validate(req.body, schemas.authSchema);

  if (result.error) {
    payload.data.result = result;
    return res.render('form/login', payload);
  }

  passport.authenticate('local', function(err, user) {
    if (err) {
      console.error(err.stack || err);

      payload.data.result = err;
      return res.render('form/login', payload);

    } else {
      debug('login user', user);

      req.user = user;

      req.login(user, function(err) {
        if (err) {
          console.error(err.stack || err);

          payload.data.result = err;
          return res.render('form/login', payload);

        } else {
          payload.data.user = req.user;
          return res.render('form/login', payload);
        }
      });
    }

  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/form/login');
});



module.exports = router;


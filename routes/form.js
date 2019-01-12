'use strict';

const debug = require('debug')('node-js-auth-sandbox:routes:form');
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { validateBody, schemas } = require('../helpers/route_helpers');
const User = require('../models/user');


router.get('/signup', function(req, res) {
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
  res.render('form/login', {
    title : 'Login Form',
    data: { params: {} }
  });
});



module.exports = router;


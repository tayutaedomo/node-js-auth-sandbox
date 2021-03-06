'use strict';

const debug = require('debug')('node-js-auth-sandbox:routes:passport');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const { JWT_SECRET } = require('../config/index');
const User = require('../models/user');

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization') ||
                  ExtractJwt.fromBodyField('token') ||
                  ExtractJwt.fromUrlQueryParameter('token'),
  secretOrKey: JWT_SECRET
}, async (payload, done) => {
  try {
    debug('JwtStrategy', payload);
    const user = User.findById(payload.sub);

    if (!user) {
      return done(null, false);
    }

    done(null, user);

  } catch(err) {
    done(err, false);
  }
}));

passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {

  try {
    const user = await User.findOne({ email });

    if (!user) {
      debug('User is not found.');
      return done(null, false);
    }

    debug('LocalStrategy', user);

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      debug('Password is unmatched.');
      return done(null, false);
    }

    done(null, user);

  } catch (error) {
    done(error, false);
  }
}));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


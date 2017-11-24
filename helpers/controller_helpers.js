'use strict';

const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/index');


const signToken = ((user, options) => {
  options = options || {};

  return JWT.sign({
    iss: 'ApiAuth',
    sub: user.id,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 1)
  }, JWT_SECRET, options)
});


module.exports = {
  signToken: signToken
};


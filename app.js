'use strict';

var express = require('express');
var engine = require('ejs-mate');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const beautify = require('js-beautify').js_beautify;

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB || 'mongodb://localhost:27017/api-auth');

var index = require('./routes/index');
var apiAuth = require('./routes/api_auth');
var expressJwt = require('./routes/express_jwt');
var googleAuthenticator = require('./routes/google_authenticator');
var form = require('./routes/form');

var app = express();

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// locals
app.locals.beautify = beautify;

app.use('/', index);
app.use('/api-auth', apiAuth);
app.use('/express-jwt', expressJwt);
app.use('/google-authenticator', googleAuthenticator);
app.use('/form', form);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


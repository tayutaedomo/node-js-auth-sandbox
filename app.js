'use strict';

const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const beautify = require('js-beautify').js_beautify;

const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const index = require('./routes/index');
const apiAuth = require('./routes/api_auth');
const expressJwt = require('./routes/express_jwt');
const googleAuthenticator = require('./routes/google_authenticator');
const form = require('./routes/form');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB || 'mongodb://localhost:27017/api-auth');


const app = express();

app.use(logger('dev'));

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET || 'session_secret',
  store: new MongoStore({
    url: process.env.MONGODB || 'mongodb://localhost:27017/api-auth',
    autoReconnect: true
  })
}));

app.use(passport.initialize());
app.use(passport.session());


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


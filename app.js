var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressSession = require('express-session')
const MongoStore = require('connect-mongo')(expressSession);
var expressValidator = require('express-validator')
var mongo = require('mongodb');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const TWO_HOURS = 1000 * 60 * 60 * 20;

const SESS_SECRET = process.env.SECRET || 'defaultsecret'
const SESS_NAME = process.env.SESS_NAME || 'sid'
const SESS_LIFETIME = process.env.SESS_LIFETIME || TWO_HOURS
const IN_PROD = process.env.IN_PROD || false

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/calendar"

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({secret: SESS_SECRET, store: new MongoStore({ url: MONGODB_URI }), saveUninitialized: false, resave: false, name: SESS_NAME, cookie: {
  maxAge: SESS_LIFETIME,
  secure: IN_PROD
}}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

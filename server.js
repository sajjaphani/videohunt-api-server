var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const passport = require('passport')

const token = require('./app/util/token');
const { SESSION_COOKIE_NAME } = require('./app/util/misc');

var models = require("./app/models");
var routes = require("./app/routes");

require('./app/authentication/jwt');
require('./app/authentication/google');
require('./app/authentication/facebook');
require('connect-mongo')(session);

var env = require('./app/util/env');
var connectionUrl = env.MONGO_CONNECTION_URL;
const { connect } = require("./app/db");
connect(connectionUrl);

// Initialize express
var app = express();

// Configure database
app.set('models', models);

app.use(bodyParser.json({
  type: function () {
    return true;
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('*', (req, res, next) => {
  next();
});

// Configure router
app.use('/', routes);

// Passport js
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

function generateUserToken(req, res) {
  // generate jwt token
  const accessToken = token.generateAccessToken(req.user);
  const { getClientBaseUrl } = require('./app/util/host-utils');

  const frontEndHost = getClientBaseUrl();
  const redirectUrl = `${frontEndHost}/login/success?session-token=${accessToken}`;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  res.cookie(SESSION_COOKIE_NAME, accessToken, { expires: tomorrow, httpOnly: true });
  res.redirect(redirectUrl);
}

app.get('/api/v1/authentication/google',
  passport.authenticate('google', { session: false, scope: ['openid', 'profile', 'email'] }));
app.get('/api/authentication/google/redirect',
  passport.authenticate('google', { failureRedirect: '/' }),
  generateUserToken);

app.get('/api/v1/authentication/facebook',
  passport.authenticate('facebook', { session: false }));
app.get('/api/v1/authentication/facebook/redirect',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  generateUserToken);

// catch 404 and forward to error handler
// As it is an API server, we need to send proper error message in Json
app.use(function (req, res, next) {
  var mesg = req.protocol + '://' + req.get('Host') + req.url + ' Not Found';
  var err = new Error(mesg);
  err.status = 404;
  next(err);
});

/****************************************************************************
    Error handlers
****************************************************************************/

// development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    if (err) {
      console.log('Error in Dev mode');
      console.log(JSON.stringify(err.stack, null, 2));
    }
    res.status(err.status || 500);
    res.status(err.status || 500).json({ status: 'error', error: err });
  });
}

// production error handler
// no stacktraces should be leaked to user
app.use(function (err, req, res, next) {
  if (err)
    console.log(JSON.stringify(err.stack, null, 2));
  res.status(err.status || 500);
  res.status(err.status || 500).json({ status: 'error', error: 'Something unexpected happen. Try again!' });
});

module.exports = app;
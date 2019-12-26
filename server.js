var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const favicon = require('serve-favicon')
const mustacheExpress = require('mustache-express');
const passport = require('passport')
var path = require('path')

const token = require('./app/util/token');

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

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/public');

// Configure database
app.set('models', models);

app.use(bodyParser.json({
  type: function () {
    return true;
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));

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
  console.log('URL', req.url);
  // generate jwt token
  const accessToken = token.generateAccessToken(req.user);

  const baseHost = req.protocol + '://' + req.get('host');
  const redirectUrl = `${baseHost}/login/success?session-token=${accessToken}`;
  res.redirect(redirectUrl);
  // res.render('authenticated.html', {
  //   token: accessToken
  // });
}

app.get('/api/v1/authentication/google',
  passport.authenticate('google', { session: false, scope: ['openid', 'profile', 'email'] }))
app.get('/api/authentication/google/redirect',
  passport.authenticate('google', { session: false }),
  generateUserToken)

app.get('/api/v1/authentication/facebook',
  passport.authenticate('facebook', { session: false }));
app.get('/api/v1/authentication/facebook/redirect',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  generateUserToken);

app.get('/api/v1/secure',
  (req, res, next) => {
    passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
      if (err)
        return next(err);
      if (user === false) {
        // User not loggedin, so send feed/comments without logged in user context
        console.log('User not logged in');
        res.json({ msg: 'User not logged in' })
      } else {
        // User loggedin so send feed/comments with user context
        console.log('User logged in');
        res.json({ msg: 'User logged in', user: user })
      }
    })(req, res, next);
  });

app.get('/api/v1/secure2',
  passport.authenticate(['jwt'], { session: false }),
  (req, res, next) => {

    res.json({ msg: 'secure2' })
  });

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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces should be leaked to user
app.use(function (err, req, res, next) {
  if (err)
    console.log(JSON.stringify(err.stack, null, 2));
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
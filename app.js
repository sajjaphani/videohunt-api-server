var bodyParser = require('body-parser');
var env = require('./util/env');
var express = require('express');
const favicon = require('serve-favicon')
const mustacheExpress = require('mustache-express');
const passport = require('passport')
var path = require('path')
var routes = require("./routes");
var session = require('express-session');
const token = require('./util/token');
require('./authentication/jwt');
require('./authentication/google');
require('./authentication/facebook');

var MongoStore = require('connect-mongo')(session);
var connectionUrl = env.MONGO_CONNECTION_URL;
var db = require("./db")(connectionUrl);
var models = require("./models")(db);

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

// Configure router
app.use('/', routes);

// Passport js
app.use(passport.initialize());

function generateUserToken(req, res) {
  // generate jwt token
  const accessToken = token.generateAccessToken(req.user);
  
  res.render('authenticated.html', {
    token: accessToken
  });
}

app.get('/api/v1/authentication/google',
  passport.authenticate('google', { session: false, scope: ['openid', 'profile', 'email'] }))
app.get('/api/authentication/google/redirect',
  passport.authenticate('google', { session: false }),
  generateUserToken)

app.get('/api/v1/authentication/facebook',
  passport.authenticate('facebook', { session: false }));
app.get('/api/v1/authentication/facebook/redirect',
  passport.authenticate('facebook', { session: false }),
  generateUserToken);

app.get('/api/v1/secure',
  (req, res, next) => {
    passport.authenticate(['jwt'], { session: false }, function (err, user, info) {
      if (err)
        return next(err);
      if (user === false) {
        // User not loggedin, so send feed/comments without logged in user context
        console.log('User not logged in');
        res.json({msg:'User not logged in'})
      } else {
        // User loggedin so send feed/comments with user context
        console.log('User logged in');
        res.json({msg: 'User logged in', user: user})
      }
    })(req, res, next);
  });

  app.get('/api/v1/secure2',
  passport.authenticate(['jwt'], { session: false }),
  (req, res, next) => {
    
     res.json({msg:'secure2'})
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
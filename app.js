var env = require('./util/env');

var express = require('express');
var app = express();

var path = require('path');
var favicon = require('serve-favicon');
// var mlogger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var logger = require("./util/videohunt-logger");

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Configure database
var connectionUrl = env.MONGO_CONNECTION_URL;
var db = require("./db")(connectionUrl);
var models = require("./models")(db);
app.set('models', models);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(mlogger('dev'));
app.use(bodyParser.json({
  type: function () {
    return true;
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// Configure router
var routes = require("./routes");
app.use('/', routes)

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
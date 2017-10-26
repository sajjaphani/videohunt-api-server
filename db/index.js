var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var database = function (connUrl) {

    //connect to MongoDB
    var db = mongoose.createConnection(connUrl);

    db.on('error', function (err) {
        if (err) throw err;
    });

    db.once('open', function callback() {
        console.info('Mongo db connected successfully');
    });

    process.on('SIGINT', function () {
        db.close(function () {
            console.log('Mongoose connection closed as app terminates');
            process.exit(0);
        });
    });

    return db;
}

module.exports = database;
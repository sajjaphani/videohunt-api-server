const mongoose = require('mongoose');

const connect = (connUrl) => {

    //connect to MongoDB
    mongoose.connect(connUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    const connection = mongoose.connection;
    connection.on('error', function (err) {
        if (err) throw err;
    });

    connection.once('open', function callback() {
        console.info('Mongo db connected successfully');
    });

    process.on('SIGINT', () => {
        connection.close(() => {
            console.log('Mongoose connection closed as app terminates');
            process.exit(0);
        });
    });

    return connection;
}

module.exports = { connect };
'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

gulp.task('default', ['nodemon'], function () {
    console.log('Gulp')
});

// We do not require browser syn for API server for now
gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ['./public/**/*.*', './app.js', './routes/**/*.*', './util/**/*.*', './models/**/*.*'],
        browser: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        port: 7000,
    });
});

gulp.task('nodemon', ['mongo-start'], function (cb) {
    var started = false;

    return nodemon({
        exec: 'node --debug',
        script: './bin/www'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    })
});

let mongoLocation = 'c:/Program Files/MongoDB/Server/3.2/bin'
let dbpath = 'C:/Phani/mongodb/data'
// Mongodb handling
let exec = require('child_process').exec;

let runCommand = function (command) {
    console.log('CMD: ' + command)
    exec(command, {
        cwd: mongoLocation
    }, function (err, stdout, stderr) {
        if (err) {
            console.log('exec error: ' + err);
        }
        console.log(stdout);
        console.log(stderr);
    });
}

gulp.task("mongo-start", function () {
    console.log('mongo start')
    var command = "mongod --dbpath " + dbpath
    runCommand(command);
});

gulp.on('finish', function () {
    // Mongo close
});

gulp.task("mongo-stop", function () {
    console.log('mongo stop')
    // var command = 'mongo admin --eval "db.shutdownServer();"'
    // runCommand(command);
});
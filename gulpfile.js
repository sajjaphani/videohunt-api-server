'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

gulp.task('default', ['nodemon'], function () {

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

gulp.task('nodemon', function (cb) {
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
    });
});
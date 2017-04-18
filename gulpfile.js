let gulp = require('gulp');
let ghelper = require('gulp-helper');
let pkg = require('./package.json');
let concat = require('gulp-concat');
let banner =
    ["/* ",
     " * <%= pkg.name %> <%= pkg.version %>",
     " * <%= pkg.description %>",
     " * MIT Licensed",
     " * ",
     " * Copyright (C) 2017 EEIC, http://eeic.jp",
     " */",
     "",
     "",
     "'use strict';",
     "",
     "",
     "phina.globalize();"
    ].join('\n');

let header = require('gulp-header');

gulp.task('default', ['concat']);
gulp.task('dev', ['watch']);

gulp.task('concat', function(){
    return gulp.src('./src/js/*.js')
        .pipe(concat('bundle.js'))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('watch', function() {
    gulp.watch(['./src/*', './src/**/*'], ['default']);
});

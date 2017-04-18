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
    ].join('\n');
let globalize = "\nphina.globalize();\n";

let header = require('gulp-header');

gulp.task('default', ['concat']);
gulp.task('dev', ['watch']);

gulp.task('concat', ['concat-blockly-def', 'concat-html-behavior', 'concat-phina-app']);

gulp.task('concat-phina-app', function(){
    return gulp.src('./src/js/phina-app/*.js')
        .pipe(concat('phina-app.js'))
        .pipe(header(banner + globalize, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('concat-blockly-def', function(){
    return gulp.src('./src/js/blockly-def/*.js')
        .pipe(concat('blockly-def.js'))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('concat-html-behavior', function(){
    return gulp.src('./src/js/html-behavior/*.js')
        .pipe(concat('html-behavior.js'))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('watch', function() {
    gulp.watch(['./src/*', './src/**/*'], ['default']);
});

const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const $                     = require('gulp-load-plugins')();
const sassdoc               = require('sassdoc');
const jsdoc                 = require('gulp-jsdoc3');

var compileDocs = {
    generateSassDocs: function() {
        return gulp.src(configs.sassdoc.src)
            .pipe(sassdoc({
                dest: configs.sassdoc.dest
            }))
    },
    generateJsDocs: function() {
        return gulp.src('./node_modules/foundation-sites/js/**/*.js', {read: false})
            .pipe(jsdoc());
    }
}

module.exports = compileDocs;

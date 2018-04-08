const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const $                     = require('gulp-load-plugins')();

var vendor = {
    init: function() {
        return gulp.src(configs.paths.vendors)
            .pipe($.concat('vendor.min.js'))
            .pipe(gulp.dest(configs.paths.app.scripts))
            .on('finish', () => {
                // console.log();
            });
    }
}

module.exports = vendor;
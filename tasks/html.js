const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const $                     = require('gulp-load-plugins')();

var compileHtml = {
    init: function() {
        return gulp.src(configs.dev + '*.{html, njk}')
            .pipe($.nunjucks.compile())
            .pipe(gulp.dest(configs.app))
            .on('finish', () => {
                // console.log();
            });
    }
}

module.exports = compileHtml;
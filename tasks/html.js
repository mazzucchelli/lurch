const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const $                     = require('gulp-load-plugins')();

var compileHtml = {
    compileHtml: function() {
        return gulp.src(configs.paths.dev.base + '*.{html, njk}')
            .pipe($.nunjucks.compile())
            .pipe(gulp.dest(configs.paths.app.base))
            .on('finish', () => {
                // console.log();
            });
    }
}

module.exports = compileHtml;
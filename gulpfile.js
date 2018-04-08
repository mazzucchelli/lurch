const configs               = require('./gulpconfigs.js');
const settings              = require('./gulpsettings.js');
const gulp                  = require('gulp');
const chalk                 = require('chalk');
const gulpLoadPlugins       = require('gulp-load-plugins');

const htmlTask              = require('./tasks/html');
const imagesTask            = require('./tasks/images');
const scriptsTask           = require('./tasks/scripts');
const stylesTask            = require('./tasks/styles');
const vendorTask            = require('./tasks/vendor');
const spriteTask            = require('./tasks/sprite');

// const filesize              = require('gulp-filesize');
// console.log('env', process.env.NODE_ENV);

// npm run compile
gulp.task('compile', gulp.parallel(
    scriptsTask.init, 
    stylesTask.init, 
    htmlTask.init, 
    spriteTask.init, 
    vendorTask.init
));

// npm run compile:scss
gulp.task('styles', gulp.series(stylesTask.lint, stylesTask.init));

// npm run enchant:scss
gulp.task('beautifyScss', stylesTask.beautify);

// npm run lint:scss
gulp.task('scssLint', stylesTask.lint);

// npm run enchant:media
gulp.task('images', imagesTask.init);

// npm run compile:html
gulp.task('html', htmlTask.init);

// npm run compile:vendor
gulp.task('vendor', vendorTask.init);

// npm run compile:js
gulp.task('scripts', scriptsTask.init);

// npm run compile:sprite
gulp.task('icons', spriteTask.init);

gulp.task('watch', function () {
    // gulp.watch(configs.paths.dev.js + '/**/*.js', gulp.series(scripts));
    // gulp.watch(configs.paths.dev.scss + '**/*.scss', gulp.series(scssLint, compileScss));
    // gulp.watch(configs.paths.dev.svg + '/*.svg', ['icons']);
});

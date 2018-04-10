const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const fontgen               = require('gulp-fontgen');
const $                     = require('gulp-load-plugins')();
const del                   = require("del");

// FIXME update with `gulp-load-plugins`
const replace               = require('gulp-replace');
const rename                = require('gulp-rename');
const concat                = require('gulp-concat');
const ext_replace           = require('gulp-ext-replace');

var fontsTask = {
    generateFonts: function() {
        return gulp.src(configs.paths.dev.fonts + '**/*.{ttf,otf}')
            .pipe(fontgen({
                dest: "./fontdest/"
            }));
    },
    fixFontsPath: function() {
        return gulp.src(configs.paths.dev.tempfonts + '*.css')
            .pipe(replace('url("', 'url("fonts/'))
            .pipe(gulp.dest(configs.paths.dev.tempfonts))
    },
    generateFontsScss: function() {
        return gulp.src(configs.paths.dev.tempfonts + '*.css')
            .pipe(concat('all.js'))
            .pipe(rename("_fonts.scss"))
            .pipe(gulp.dest(configs.paths.dev.scss + 'fonts/'))
    },
    moveFontFiles: function() {
        return gulp.src(configs.paths.dev.tempfonts + '*.{eot,svg,ttf,woff,woff2}')
            .pipe(gulp.dest(configs.paths.app.styles + 'fonts/'))
            .on('finish', () => {
                del(configs.paths.dev.tempfonts + '**');
            });
    }
}

module.exports = fontsTask;
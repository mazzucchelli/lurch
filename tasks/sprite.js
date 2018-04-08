const configs               = require('../gulpconfigs.js');
const buffer                = require('vinyl-buffer');
const gulp                  = require('gulp');
const gulpLoadPlugins       = require('gulp-load-plugins');

const $ = gulpLoadPlugins({
    rename: {
      'gulp-svg-sprite': 'svgsprite'
    }
});

var compileSprite = {
    compileSvg: function () {
        return gulp.src(configs.paths.dev.svg + '*.svg')
            .pipe(buffer())
            .pipe($.rename(opt => {
                opt.basename = opt.basename.replace(new RegExp('_', 'g'), '-');
                return opt;
            }))
            .pipe($.svgsprite({
                mode: {
                    symbol: {
                        render: {
                            css: false,
                            scss: false
                        },
                        dest: './',
                        prefix: '.svg--%s',
                        sprite: 'sprite.svg',
                        example: true
                    }
                }
            }))
            .pipe(gulp.dest(configs.paths.app.media))
            .on('finish', () => {
                // console.log();
            });
    }
}

module.exports = compileSprite;
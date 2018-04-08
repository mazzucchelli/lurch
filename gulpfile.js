const configs               = require('./gulpconfigs.js');
const settings              = require('./gulpsettings.js');
const path                  = require('path');
const gulp                  = require('gulp');
const sourcemaps            = require('gulp-sourcemaps');
const sass                  = require('gulp-sass');
const autoprefixer          = require('gulp-autoprefixer');
const webpack               = require('gulp-webpack');
const UglifyJSPlugin        = require('uglifyjs-webpack-plugin');
const svgsprite             = require('gulp-svg-sprite');
const buffer                = require('vinyl-buffer');
const rename                = require('gulp-rename');
const concat                = require('gulp-concat');
const nunjucks              = require('gulp-nunjucks');
const imagemin              = require('gulp-imagemin');
const scsslint              = require('gulp-scss-lint');
const chalk                 = require('chalk');
const cleancss              = require('gulp-cleancss');
const gutil                 = require('gulp-util');
const csscomb               = require('gulp-csscomb');

// const filesize              = require('gulp-filesize');
// console.log('env', process.env.NODE_ENV);

gulp.task('default', gulp.series(gulp.parallel(compileJs, compileScss, compileSvgSprite, compileHtml, vendor), function() {console.log('\x1Bc')}));

gulp.task('beautifyScss', beautifyScss);
gulp.task('scssLint', scssLint);
gulp.task('images', imagesMin);
gulp.task('html', compileHtml);
gulp.task('vendor', vendor);
gulp.task('scripts', compileJs);
gulp.task('styles', gulp.series(scssLint, compileScss));
gulp.task('icons', compileSvgSprite);

gulp.task('watch', function () {
    // gulp.watch(configs.paths.dev.js + '/**/*.js', gulp.series(scripts));
    gulp.watch(configs.paths.dev.scss + '**/*.scss', gulp.series(scssLint, compileScss));
    // gulp.watch(configs.paths.dev.svg + '/*.svg', ['icons']);
});

function imagesMin() {
	return gulp.src(configs.paths.dev.images + '*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
    	.pipe(gulp.dest(configs.paths.app.media))
        .on('finish', () => {
            // console.log();
        });
};

function compileHtml() {
    return gulp.src(configs.dev + '*.{html, njk}')
        .pipe(nunjucks.compile())
        .pipe(gulp.dest(configs.app))
        .on('finish', () => {
            // console.log();
        });
};

function compileScss() {
    return gulp.src(configs.paths.dev.scss + '**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: [
                'last 4 versions',
                'ie >= 9',
                'Android >= 2.3'
            ],
            flexbox: 'no-2009',
            grid: false
        }))
        .pipe(cleancss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(configs.paths.app.styles))
        .on('finish', () => {
            // console.log();
        });
};

function beautifyScss() {
    return gulp.src(configs.paths.dev.scss + '**/*.scss', {base: './'})
    .pipe(csscomb())
    .pipe(gulp.dest('./'))
}

function scssCustomReporter(file) {
    let cleanPath = file.path.substring(file.path.indexOf(configs.dev.substring(configs.dev.indexOf('./') + 1)) + 1)
    let issueLength = file.scsslint.issues.length;
    console.logissueLength
    if (!file.scsslint.success) {
        console.log(chalk.bold( '\n    ' + issueLength + ' issues found in: ' + cleanPath + '\n'));
        file.scsslint.issues.forEach(function(issue, index)  {
            if ( issue.severity == 'error') {
                console.log(chalk.red('        🔴   ' + issue.reason + ' at line: ' + issue.line + ', col: ' + issue.column));
                (index == issueLength - 1) ? console.log(' ') : ''
            } else if ( issue.severity == 'warning' ) {
                console.log(chalk.yellow('        🔶   ' + issue.reason + ' at line: ' + issue.line + ', col: ' + issue.column));
                (index == issueLength - 1) ? console.log(' ') : ''
            }
        })
    }
};

function scssLint() {
    return gulp.src(configs.paths.dev.scss + '**/*.scss')
	.pipe(scsslint({
        customReport: scssCustomReporter
    }))
    .pipe(gulp.dest('./reports'))
};

function compileJs() {
    let entries = {};
    let filesArray = [];
    if (typeof configs.webpack.entries === 'string') {
        let file = configs.paths.dev.js + configs.webpack.entries;
        filesArray.push(file)
        entries[ path.basename(file).slice(0, - path.extname(file).length) ] = path.resolve(file);
        // console.log('filesArray -> ' + filesArray);
    } else {
        configs.webpack.entries.forEach(entry => {
            let file = configs.paths.dev.js + entry;
            filesArray.push(file)
            entries[ path.basename(file).slice(0, - path.extname(file).length) ] = path.resolve(file);
            // console.log('filesArray -> ' + filesArray);
        })
    }

    return gulp.src(filesArray)
        .pipe(webpack({
            entry: entries,
            output: {
                filename: '[name].min.js'
            },
            devtool: 'source-map',
            module: {
                loaders: [{
                    test: /\.js$/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'stage-2'],
                    }
                }]
            },
            plugins: [
                new UglifyJSPlugin({
                    sourceMap: true
                })
            ]
        }))
        .pipe(gulp.dest(configs.paths.app.scripts))
        .on('finish', () => {
            // console.log();
        });
};

function compileSvgSprite() {
    return gulp.src(configs.paths.dev.svg + '*.svg')
        .pipe(buffer())
        .pipe(rename(opt => {
            opt.basename = opt.basename.replace(new RegExp('_', 'g'), '-');
            return opt;
        }))
        .pipe(svgsprite({
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
};

function vendor() {
    return gulp.src(configs.paths.vendors)
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest(configs.paths.app.scripts))
        .on('finish', () => {
            // console.log();
        });
};

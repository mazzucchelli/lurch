const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const path                  = require('path');
const UglifyJSPlugin        = require('uglifyjs-webpack-plugin');
const $                     = require('gulp-load-plugins')();
const eslint                = require('gulp-eslint');

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

var compileScripts = {
    compileJs: function () {
        return gulp.src(filesArray)
            .pipe($.webpack({
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
    },
    // TODO Lint and autofix javascript
    lintJs: function() {
        return gulp.src(configs.paths.dev.js + '**/*.js')
            .pipe(eslint({
                fix: true,
                // TODO Explore eslint configuration
                configFile: configs.paths.dev.js + 'eslint.json'
            }))
            // eslint.format() outputs the lint results to the console.
            // Alternatively use eslint.formatEach() (see Docs).
            .pipe(eslint.format())
    }
}

module.exports = compileScripts;
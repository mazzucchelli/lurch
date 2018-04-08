const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const path                  = require('path');
const UglifyJSPlugin        = require('uglifyjs-webpack-plugin');
const $                     = require('gulp-load-plugins')();

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
    }
}

module.exports = compileScripts;
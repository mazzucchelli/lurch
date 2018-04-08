const configs               = require('./gulpconfigs.js');
const settings              = require('./gulpsettings.js');
const gulp                  = require('gulp');
const path                  = require('path');
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
    stylesTask.compileScss, 
    htmlTask.init, 
    spriteTask.init, 
    vendorTask.init
));

// npm run compile:scss
gulp.task('styles', gulp.series(stylesTask.lintScss, stylesTask.compileScss));

// npm run enchant:scss
gulp.task('beautifyScss', stylesTask.beautifyScss);

// npm run lint:scss
gulp.task('scssLint', stylesTask.lintScss);

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

// npm run start
let tasksRunning = false;
gulp.task('default', () => {
    
    console.log('\x1Bc');
    console.log(chalk.bold('Watching files in ' + configs.dev + ' folder'));

    let tasks = [];
    let images = [];
    let tasksDebounce = null;

    gulp.watch('dev/**', { ignoreInitial: true }).on('all', (event, location) => {
        if (event === 'addDir' || path.basename(location) === '.DS_Store') return;

        tasksRunning = true;
        const ext =  path.extname(location);

        if (['.jpg','.png','.gif'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('images') === -1) {
            if (event === 'unlink') {
                // delete image from the dist folder
                const delImgPath = settings.paths.destination.images + location.replace(settings.paths.source.images, '');
                if (fs.existsSync(delImgPath)) fs.unlinkSync(delImgPath);
            } else {
                images.push(location);
                tasks.push('images')
            }
        }

        if (['.svg'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('icons') === -1) {
            tasks.push('icons')
        }

        else if (['.scss'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('sass') === -1) {
            tasks.push('styles')
        }

        else if (['.js'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('scripts') === -1) {
            tasks.push('scripts')
        }

        else if (['.html', '.njk'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('html') === -1) {
            tasks.push('html')
        }

        if (tasksDebounce) {
            clearTimeout(tasksDebounce);
            tasksDebounce = null;
        }

        if (tasks.length) {
            console.log('\x1Bc');
            tasksDebounce = setTimeout(() => {
                gulp.task('run', gulp.series(...tasks, () => {
                    console.log(chalk.bold('\n--- \n'));
                    console.log(chalk.bold('Watching files in ' + configs.dev + ' folder'));
                    tasks = [];
                    images = [];
                    tasksRunning = false;
                }));
                
                gulp.task('run')(error => {
                    console.log(chalk.red('❗️ There was an error while running the queued tasks'), error);
                    tasksRunning = false;
                });
            }, 500);
        }
    });
});

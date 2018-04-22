const configs               = require('./gulpconfigs.js');
const gulp                  = require('gulp');
const fs                    = require('fs');
const path                  = require('path');
const chalk                 = require('chalk');
const gulpLoadPlugins       = require('gulp-load-plugins');

const htmlTask              = require('./tasks/html');
const imagesTask            = require('./tasks/images');
const scriptsTask           = require('./tasks/scripts');
const stylesTask            = require('./tasks/styles');
const vendorTask            = require('./tasks/vendor');
const spriteTask            = require('./tasks/sprite');
const fontsTask             = require('./tasks/fonts');
const todoTask              = require('./tasks/todo');
const docsTask              = require('./tasks/docs');
const lurchTask             = require('./tasks/alfred'); // todo rename alfred in lurch

// FIXME: standalone version of Lurch
const updateLurch = function() {
    return gulp.series(lurchTask.getScssReport, lurchTask.getTodoReport, lurchTask.compileDashboard)
}
gulp.task('lurchtest', lurchTask.getJsReport);

// npm run lurch
gulp.task('lurch', updateLurch());

// npm run compile || NODE_ENV='prod' gulp compile
gulp.task('compile', gulp.parallel(scriptsTask.compileJs, stylesTask.compileScss, htmlTask.compileHtml, spriteTask.compileSvg, vendorTask.compileVendors, imagesTask.minifyImg));

// npm run compile:scss || NODE_ENV='prod' gulp build:scss
gulp.task('styles', gulp.parallel(stylesTask.compileScss));

// npm run compile:html
gulp.task('html', gulp.parallel(htmlTask.compileHtml, updateLurch()));

// npm run compile:vendor
gulp.task('vendor', gulp.parallel(vendorTask.compileVendors, updateLurch()));

// npm run compile:js || NODE_ENV='prod' gulp build:js
gulp.task('scripts', gulp.parallel(scriptsTask.compileJs, updateLurch()));

// npm run compile:sprite
gulp.task('icons', gulp.parallel(gulp.series(spriteTask.minifySvg, spriteTask.compileSvg), updateLurch()));

// npm run compile:fonts
gulp.task('fonts', gulp.series(fontsTask.generateFonts, fontsTask.fixFontsPath, fontsTask.generateFontsScss, fontsTask.moveFontFiles));

// npm run compile:todo ~~ Deprecated
gulp.task('todo', todoTask.compileTodo);

// npm run enchant:media
gulp.task('imgmin', imagesTask.minifyImg);

// npm run enchant:svg
gulp.task('svgmin', gulp.parallel(spriteTask.minifySvg, updateLurch()));

// npm run enchant:scss
gulp.task('beautifyScss', gulp.parallel(stylesTask.beautifyScss, updateLurch()));

// npm run lint:scss ~~ Deprecated
gulp.task('scssLint', stylesTask.lintScss);

// npm run lint:js ~~ Deprecated
gulp.task('jsLint', scriptsTask.lintJs);

// npm run docs
gulp.task('docs', gulp.series(docsTask.generateSassDocs, docsTask.generateJsDocs));

// npm run docs:scss
gulp.task('scssDocs', docsTask.generateSassDocs);

// npm run docs:js
gulp.task('jsDocs', docsTask.generateJsDocs);

// npm run start
let tasksRunning = false;
gulp.task('default', () => {
    
    console.log('\x1Bc');
    console.log(chalk.bold('Watching files in ' + configs.paths.dev.base + ' folder'));

    let tasks = [];
    let images = [];
    let tasksDebounce = null;

    gulp.watch('dev/**', { ignoreInitial: true }).on('all', (event, location) => {
        if (event === 'addDir' || path.basename(location) === '.DS_Store') return;

        tasksRunning = true;
        const ext =  path.extname(location);

        if (['.jpg','.png','.gif'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('imgmin') === -1) {
            if (event === 'unlink') {
                // delete image from the dist folder
                const delImgPath = configs.paths.dest.media + location.replace(configs.paths.dev.images, '');
                if (fs.existsSync(delImgPath)) fs.unlinkSync(delImgPath);
            } else {
                images.push(location);
                tasks.push('imgmin')
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

        else if (['.html', '.njk'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('alfred') === -1) {
            tasks.push('html')
        }

        else if (['.ttf', '.otf'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('fonts') === -1) {
            tasks.push('fonts')
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

// TODO: clean task | global and for every ext files
// TODO: add iconfont task

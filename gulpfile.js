const configs               = require('./gulpconfigs.js');
const gulp                  = require('gulp');
const fs                    = require('fs');
const path                  = require('path');
const chalk                 = require('chalk');

const htmlTask              = require('./tasks/html');
const imagesTask            = require('./tasks/images');
const scriptsTask           = require('./tasks/scripts');
const stylesTask            = require('./tasks/styles');
const vendorTask            = require('./tasks/vendor');
const spriteTask            = require('./tasks/sprite');
const fontsTask             = require('./tasks/fonts');
const docsTask              = require('./tasks/docs');
const dashboardTask         = require('./tasks/dashboard');

gulp.task('dashboard',
    gulp.series(
        dashboardTask.getJsReport,
        dashboardTask.getTodoReport,
        dashboardTask.getScssReport,
        dashboardTask.getFilesizeReport,
        dashboardTask.compileDashboard
    )
);

gulp.task('savedata',
    dashboardTask.saveAssetsSize
);

gulp.task('compile',
    gulp.series(
        fontsTask.generateFonts,
        fontsTask.fixFontsPath,
        fontsTask.generateFontsScss,
        fontsTask.moveFontFiles,

        gulp.parallel(
            scriptsTask.compileJs,
            stylesTask.compileScss,
            htmlTask.compileHtml,
            spriteTask.compileSvg,
            vendorTask.compileVendors,
            imagesTask.minifyImg
        )
    )
);

gulp.task('styles',
    stylesTask.compileScss
);

gulp.task('html',
    htmlTask.compileHtml
);

gulp.task('vendor',
    vendorTask.compileVendors
);

gulp.task('scripts',
    scriptsTask.compileJs
);

gulp.task('icons',
    gulp.series(
        spriteTask.minifySvg,
        spriteTask.compileSvg
    )
);

gulp.task('fonts',
    gulp.series(
        fontsTask.generateFonts,
        fontsTask.fixFontsPath,
        fontsTask.generateFontsScss,
        fontsTask.moveFontFiles
    )
);

gulp.task('imgmin',
    imagesTask.minifyImg
);

gulp.task('beautifyScss',
    stylesTask.beautifyScss
);

gulp.task('docs',
    gulp.series(
        docsTask.generateSassDocs,
        docsTask.generateJsDocs
    )
);

gulp.task('scssDocs',
    docsTask.generateSassDocs
);

gulp.task('jsDocs',
    docsTask.generateJsDocs
);

let tasksRunning = false;

gulp.task('default', () => {

    console.log('\x1Bc');
    console.log(chalk.bold('Watching files in ' + configs.paths.dev.base + ' folder'));

    let tasks = [];
    let images = [];
    let tasksDebounce = null;

    gulp.watch(configs.paths.dev.base + '**', { ignoreInitial: true }).on('all', (event, location) => {
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

        else if (['.html', '.njk'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('html') === -1) {
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

// TODO: clean task, global and for every ext files
// TODO: add iconfont task
// TODO: add html lint task

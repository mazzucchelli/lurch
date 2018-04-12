const configs               = require('../gulpconfigs.js');
const _                     = require('lodash');
const chalk                 = require('chalk');
const gulp                  = require('gulp');
const $                     = require('gulp-load-plugins')();

// FIXME update with `gulp-load-plugins`
const todo                  = require('gulp-todo');

let issuesJson; // update todo list here

var todoTask = {
    compileTodo: function () {
        // TODO Dynamic `gulp.src` from gulp settings
        return gulp.src([configs.paths.dev.base + '*.{html|njk}', configs.paths.dev.base + 'js/**/*.js', configs.paths.dev.base + 'scss/**/*.scss', './tasks/*.js'], {
                base: './'
            })
            .pipe(todo())
            .pipe(gulp.dest('./app/'))
            
            // TODO Generate html
            // TODO Prompt tasks
            
            /*
            .pipe(todo({
                fileName: 'todo.json',
                reporter: 'json'
            }))
            .pipe(gulp.dest('./reports'))
            .on('finish', () => {
                issuesJson = require('../reports/todo.json');
                let prevFile;
                console.log('');
                issuesJson.forEach(function(issue, index)  {
                    // console.log('index', index);
                    console.log('prevfilF', prevFile);
                    console.log('issue.file', issue.file);
                    console.log(chalk.blue('  🔶  ' + issue.file + ':' + issue.line + ' | ' + issue.text));
                    if (prevFile != issue.file && index != 0) {console.log('')};
                    prevFile = issue.file;
                })
                console.log('');
            });
            */
    }
}

module.exports = todoTask;

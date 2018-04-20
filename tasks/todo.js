// FIXME update with `gulp-load-plugins`
const configs               = require('../gulpconfigs.js');
const _                     = require('lodash');
const chalk                 = require('chalk');
const gulp                  = require('gulp');
const path                  = require('path');
const $                     = require('gulp-load-plugins')();

let issuesJson; // update todo list here

var watchPath = [];
configs.todowatch.forEach(function (v) {
    watchPath.push(path.join(__dirname, '..', v));
});


var todoTask = {
    compileTodo: function () {
        console.log('watchPath', watchPath);
        return gulp.src(watchPath, {base: './'})
            .pipe($.todo())
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

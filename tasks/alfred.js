const configs               = require('../gulpconfigs.js');
const gulp                  = require('gulp');
const path                  = require('path');
const fs                    = require('fs');
const _                     = require('underscore-node');
const gulpLoadPlugins       = require('gulp-load-plugins');
const Vinyl                 = require('vinyl');

const $ = gulpLoadPlugins({
    rename: {
        'gulp-scss-lint': 'scsslint'
    }
});

// store reports here
let scssReport, sizeReport, jsReport, todoReport;

// get files for todo reporter
let watchPath = [];
configs.todowatch.forEach(function (v) {
    watchPath.push(path.join(__dirname, '..', v));
});

// get files for filesize reporter
let files = [];

// variables used in scss reporter
let scssIssues = [];
let scssTempIssue = {};
let scssTempInfo = [];

let jsIssues = [];
let jsTempIssue = {};
let jsTempInfo = [];

const compileLurch = {
    getJsReport: function() {
        let jsonPath = '';
        return gulp.src(configs.paths.dev.js + '**/*.js')
            .pipe($.eslint({
                configFile: configs.paths.dev.js + '.eslintrc.json'
            }))
            .pipe($.eslint.result(result => {
                jsTempIssue.path = result.filePath.substring(result.filePath.indexOf('js') + 2);
                result.messages.forEach(issue => {
                    jsTempInfo.push({
                        ruleId: issue.ruleId,
                        line: issue.line,
                        column: issue.column,
                        severity: issue.severity,
                        reason: issue.message
                    })
                })
                jsTempIssue.info = jsTempInfo;
                jsIssues.push(jsTempIssue);
                jsTempInfo = [];
                jsTempIssue = {};
            }))
            .on('end', () => {
                jsReport = '';
                jsReport = jsIssues;
            });
    },
    getTodoReport: function () {
        return gulp.src(watchPath, {base: './'})
            .pipe($.todo({
                fileName: 'todosReport.json',
                reporter: 'json'
            }))
            .pipe(gulp.dest('../reports/'))
            .on('end', () => {
                // console.log('jsIssues', JSON.stringify(jsIssues));
                // fs.writeFile('../reports/jsReport.json', jsIssues, 'utf8', function() {return});
            });
    },
    getFilesizeReport: function() {
        // return;
    },
    getScssReport: function() {
        return gulp.src(configs.paths.dev.scss + '**/*.scss')
            .pipe($.scsslint({
                'reporterOutput': '../reports/scssReport.json',
                customReport: function scssCustomReporter(file) {
                    if (!file.scsslint.success) {
                        file.scsslint.issues.forEach(function(issue) {
                            scssTempInfo.push({
                                line: issue.line,
                                column: issue.column,
                                length: issue.length,
                                severity: issue.severity,
                                reason: issue.reason,
                                linter: issue.linter
                            });
                        })
                        let currentFile = file.history.toString().substring(file.history.toString().indexOf('scss') + 4);
                        scssTempIssue.path = currentFile;
                        scssTempIssue.info = scssTempInfo;
                        scssIssues.push(scssTempIssue);
                    }
                    scssTempIssue = {};
                    scssTempInfo = [];
                }
            })).on('end', () => {
                // console.log('jsIssues', JSON.stringify(scssIssues));
                // fs.writeFile('../reports/stylesReport.json', scssIssues, 'utf8', function() {return});
                scssReport = '';
                scssReport = scssIssues;
            });
    },
    compileDashboard: function() {
        // let scssReport = require('../reports/stylesReport.json'),
            // sizeReport = require('../reports/sizesReport.json'),
            // jsReport = require('../reports/jsReport.json'),
            // todoReport = _.groupBy(require('../reports/todosReport.json'), function(t){return t.kind});
        
        return gulp.src(configs.paths.dev.base + '*.{html,njk}')
            .pipe($.data(() => ({scssReport: scssReport})))
            // .pipe($.data(() => ({sizeReport: sizeReport})))
            .pipe($.data(() => ({jsReport: jsReport})))
            // .pipe($.data(() => ({todoReport: todoReport})))
            .pipe($.nunjucks.compile())
            .pipe(gulp.dest(configs.paths.dest.base))
            .on('end', function(){
                scssIssues = []; 
                jsIssues = [];                
            })
    }
}

module.exports = compileLurch;

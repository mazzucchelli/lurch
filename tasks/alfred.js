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

function getData(path) {
    return require(path);
}

function generateReport(filename, string) {
    const src = require('stream').Readable({ objectMode: true })
    src._read = function () {
        this.push(new Vinyl({
            cwd: '/',
            base: './',
            path: filename,
            contents: new Buffer(string)
          }))
        this.push(null)
    }
    return src
}

function getReport(filename, string) {
    return generateReport(filename, string)
        .pipe(gulp.dest('reports/'))
}

// get files for todo reporter
var watchPath = [];
configs.todowatch.forEach(function (v) {
    watchPath.push(path.join(__dirname, '..', v));
});

// get files for filesize reporter
let files = [];

// variables used in scss reporter
let tempIssues = [];
let tempIssue = {};
let tempInfo = [];

let jsIssues = [];
let jsTempIssue = {};
let jsTempInfo = [];

var compileLurch = {
    test: function() {
        return getReport('test', 'test');
    },
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
            .pipe(getReport('test.json', 'Just a test!'))
            .on('end', () => {
                // console.log('jsIssues', jsIssues);
                // fs.writeFile('./reports/jsReport.json', JSON.stringify(jsIssues), function() {return});
            });
    },
    getTodoReport: function () {
        return gulp.src(watchPath, {base: './'})
            .pipe($.todo({
                fileName: 'todosReport.json',
                reporter: 'json'
            }))
            .pipe(gulp.dest('./reports/'))
    },
    getFilesizeReport: function() {
        // return;
    },
    getScssReport: function() {
        return gulp.src(configs.paths.dev.scss + '**/*.scss')
            .pipe($.scsslint({
                'reporterOutput': './reports/scssReport.json',
                customReport: function scssCustomReporter(file) {
                    if (!file.scsslint.success) {
                        file.scsslint.issues.forEach(function(issue) {
                            tempInfo.push({
                                line: issue.line,
                                column: issue.column,
                                length: issue.length,
                                severity: issue.severity,
                                reason: issue.reason,
                                linter: issue.linter
                            });
                        })
                        let currentFile = file.history.toString().substring(file.history.toString().indexOf('scss') + 4);
                        tempIssue.path = currentFile;
                        tempIssue.info = tempInfo;
                        tempIssues.push(tempIssue);
                    }
                    tempIssue = {};
                    tempInfo = [];
                }
            })).on('end', () => {
                fs.writeFile('./reports/stylesReport.json', JSON.stringify(tempIssues), function() {return});
            });
    },
    compileDashboard: function() {
        let scssReport = "",
            sizeReport = "",
            jsReport = "",
            todoReport = "";

        scssReport = getData('../reports/stylesReport.json'),
        sizeReport = getData('../reports/sizesReport.json'),
        jsReport = getData('../reports/jsReport.json'),
        todoReport = _.groupBy(getData('../reports/todosReport.json'), function(t){return t.kind});
        
        return gulp.src(configs.paths.dev.base + '*.{html,njk}')
            .pipe($.data(() => ({scssReport: scssReport})))
            .pipe($.data(() => ({sizeReport: sizeReport})))
            .pipe($.data(() => ({jsReport: jsReport})))
            .pipe($.data(() => ({todoReport: todoReport})))
            .pipe($.nunjucks.compile())
            .pipe(gulp.dest(configs.paths.dest.base))
    }
}

module.exports = compileLurch;

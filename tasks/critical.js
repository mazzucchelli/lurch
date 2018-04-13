const configs               = require('../gulpconfigs.js');
const _                     = require('lodash');
const chalk                 = require('chalk');
const gulp                  = require('gulp');
const $                     = require('gulp-load-plugins')();
const request               = require('request');
const source                = require('vinyl-source-stream');
const buffer                = require('vinyl-buffer');
const dom                   = require('gulp-dom');
const critical              = require('critical');
const replace               = require('gulp-replace');
const puppeteer             = require('puppeteer');
const fs                    = require('fs');

const scrapePath = "";

const compilePupCritical = function () {
    return critical.generate({
        inline: true,
        base: 'scrape/',
        src: 'home-puppeteer.html',
        dest: 'home-puppeteer-critical.html',
        ignore: ['@font-face',/url\(/],
        width: 1300,
        height: 900
    });
}

var criticalTask = {
    scrape: function () {
        return request('https://www.pinko.com')
            .pipe(source('home.html'))
            .pipe(buffer())
            .pipe(dom(function(){
                return this;
            }, false))
            .pipe(gulp.dest('./scrape')); 
    },
    fixPaths: function() {
        return gulp.src('./scrape/home-puppeteer.html')
        .pipe(replace('"/on/demandware.static/', '"https://www.pinko.com/on/demandware.static/'))
        .pipe(gulp.dest('./scrape')); 
    },
    compileCritical: function () {
        return critical.generate({
            inline: true,
            base: 'scrape/',
            src: 'home-puppeteer.html',
            dest: 'home-puppeteer-critical.html',
            ignore: ['@font-face',/url\(/],
            styleTarget: 'scrape/home-puppeteer.css',
            width: 1300,
            height: 900
        });
    },
    puppeteer: function() {
        return puppeteer.launch().then(function(browser) {
            browser.newPage().then(function(page) {
                page.goto('https://www.pinko.com').then(function() {
                    page.$eval('html', function(document) {
                        return document.outerHTML;
                    }).then(function(result) {
                        fs.writeFile("./scrape/home-puppeteer.html", result, function(err) {
                            if ( err ) {
                                return console.log(err);
                            }
                        });
                        browser.close();
                    });
                });
            });
        });
    }
}

module.exports = criticalTask;


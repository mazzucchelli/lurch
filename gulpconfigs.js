// TODO Get folder values from env variables 
const dev = './dev/';
const app = './app/';
const build = './build/';
const pkg = './node_modules/';

module.exports = {
    paths: {
        dev: {
            base: dev,
            js: dev + 'js/',
            scss: dev + 'scss/',
            images: dev + 'images/',
            svg: dev + 'svg/',
            fonts: dev + 'fonts/',
            tempfonts: './fontdest/'
        },
        app: {
            base: app,
            scripts: app + 'scripts/',
            styles: app + 'styles/',
            media: app + 'media/'
        },
        build: {
            base: build,
            scripts: build + 'scripts/',
            styles: build + 'styles/',
            media: build + 'media/'
        },
        vendors: [
            pkg + 'jquery/dist/jquery.js',
            pkg + 'svg4everybody/dist/svg4everybody.js',
            pkg + 'picturefill/dist/picturefill.js'
        ]
    },
    todowatch: [
        dev + '*.{html|njk}',
        dev + 'js/**/*.js',
        dev + 'scss/**/*.scss',
        'tasks/*.js'
    ],
    webpack: {
        entries: [
            'main.js'
        ]
    }
}

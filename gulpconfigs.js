// TODO Get folder values from env variables 
const dev = './dev/';
const app = './app/';
const build = './build/';
const pkg = './node_modules/';

const dest = (process.env.NODE_ENV == 'prod') ? build : app;

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
        dest: {
            base: dest,
            scripts: dest + 'scripts/',
            styles: dest + 'styles/',
            media: dest + 'media/'
        },
        vendors: [
            pkg + 'jquery/dist/jquery.min.js',
            pkg + 'svg4everybody/dist/svg4everybody.min.js',
            pkg + 'picturefill/dist/picturefill.min.js'
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

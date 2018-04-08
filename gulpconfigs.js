const dev = './dev/';
const app = './app/';
const build = './build/';
const pkg = './node_modules/';

module.exports = {
    dev, app, build,
    paths: {
        dev: {
            js: dev + 'js/',
            scss: dev + 'scss/',
            images: dev + 'images/',
            svg: dev + 'svg/'
        },
        app: {
            scripts: app + 'scripts/',
            styles: app + 'styles/',
            media: app + 'media/'
        },
        build: {
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
    webpack: {
        entries: [
            'main.js'
        ]
    }
}

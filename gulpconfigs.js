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
            scss: [
                dev + 'scss/*.scss',
                dev + 'scss/pages/*.scss',
                dev + 'scss/plugins/*.scss'
            ],
            images: dev + 'images/',
            svg: dev + 'svg/',
            fonts: {
                filesource: dev + 'fonts/',
                tempdest: './fontdest/',
                scssdest: dev + 'scss/configs/',
                scssname: '_fonts.scss',
                urlReplace: {
                    from: 'url("',
                    to: 'url("fonts/',
                }
            }
        },
        dest: {
            base: dest,
            scripts: dest + 'scripts/',
            styles: dest + 'styles/',
            media: dest + 'media/',
            uikit: dest + 'uikit/',
            fonts: dest + 'styles/fonts/'
        },
        vendors: [
            pkg + 'jquery/dist/jquery.min.js',
            pkg + 'foundation-sites/dist/js/foundation.min.js',
            pkg + 'what-input/dist/what-input.min.js'
        ]
    },
    uikit: [
        "uikit",
        "widgets"
    ],
    sassdoc: {
        src: './node_modules/foundation-sites/scss/**/*.scss',
        dest: './docs/styles/'
    },
    todowatch: [
        dev + '*.{html|njk}',
        dev + 'js/**/*.js',
        dev + 'scss/**/*.scss',
        './tasks/*.js',
        './gulpfile.js',
        './gulpconfigs.js'
    ],
    webpack: {
        entries: [
            dev + 'js/main.js',
            dev + 'js/checkout.js',
            dev + 'js/plp.js',
            dev + 'js/pdp.js',
            dev + 'js/widgets.js',
            dev + 'js/cart.js'
        ]
    },
    alfred: {
        filesize: [
            dest + 'styles/global.css',
            dest + 'styles/widgets.css',
            dest + 'styles/plp.css',
            dest + 'styles/pdp.css',
            dest + 'styles/myaccount.css',
            dest + 'styles/checkout.css',
            dest + 'scripts/main.min.js',
            dest + 'scripts/checkout.min.js',
            dest + 'scripts/plp.min.js',
            dest + 'scripts/pdp.min.js',
            dest + 'scripts/widgets.min.js',
            dest + 'scripts/widgets.min.js',
            dest + 'scripts/cart.min.js',
            dest + 'media/sprite.svg'
        ]
    }
}

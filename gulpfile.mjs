import { src, dest, watch, series, parallel } from 'gulp';
import { deleteAsync } from 'del';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import bSync from 'browser-sync';

const sass = gulpSass(dartSass);
const browserSync = bSync.create(); 

const paths = {
    html: {
        src: ['src/html/**/*.html', 'index.html'],
        dest: 'dist/'
    },
    css: {
        src: "src/css/**/*.css",
        dest: "dist/css"
    },
    scss: {
        src: 'src/scss/style.scss',
        dest: 'dist/css'
    },
    js: {
        src: "src/js/**/*.js",
        dest: "dist/js"
    },
    images: {
        src: "src/images/**/*.*",
        dest: "dist/images"
    }
};

// Clean dist
export const clean = () => deleteAsync(['dist/*', '!dist']);

// Build html
export function html() {
    return src(paths.html.src)
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Build css
export function css() {
    return src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(cleanCSS())
    .pipe(rename({basename:'style', suffix: '.min'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(paths.css.dest))
    .pipe(browserSync.stream());
}

// Build styles
export function styles() {
    return src(paths.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(rename({basename:'style', suffix: '.min'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// Build scripts
export function scripts() {
    return src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(terser())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// Build images
export function images() {
    return src(paths.images.src)
    .pipe(dest(paths.images.dest))
    .pipe(browserSync.stream());
}

// Watch files
export function watcher() {
    watch(paths.html.src, html);
    watch(paths.css.src, css);
    watch(paths.scss.src, styles);
    watch(paths.js.src, scripts);
    watch(paths.images.src, images);
}

export function sync() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
}

export const serve = series(clean, parallel(sync, watcher));
export const dev = series(clean, parallel(sync, watcher));
export const build = series(clean, parallel(html, css, styles, scripts, images));

export default serve;
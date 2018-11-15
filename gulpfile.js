'use strict'

// standard things
const gulp = require('gulp');
const fs = require('fs');

// gulp plugins
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const data = require('gulp-data');
const imagemin = require('gulp-imagemin');
const nunjucks = require('gulp-nunjucks');
const pngquant = require('imagemin-pngquant');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');


// --------------------------------------
// set paths
// --------------------------------------
const config = {
  distPath: 'dist',
  scssSrcPath: 'application/src/scss',
  jsSrcPath: 'application/src/js',
  imgSrcPath: 'application/static/images',
  templatesPath: 'application/templates'
};


// --------------------------------------
// Tasks for working with images
// --------------------------------------
gulp.task('clean-images', function () {
  return gulp.src(`${config.distPath}/static/images/*`, {read: false})
    .pipe(clean());
});

gulp.task('copy-imgs-jpg', ['clean-images'], () => {
  gulp.src(`${config.imgSrcPath}/**/*.jpg`)
    .pipe(gulp.dest(`${config.distPath}/images`));
});

gulp.task('copy-imgs-png', () => {
  gulp.src(`${config.imgSrcPath}/**/*.png`)
    .pipe(imagemin([pngquant({quality:'70', speed: 2, floyd: 1})], {verbose: true}))
    .pipe(gulp.dest(`${config.distPath}/static/images`))
});

gulp.task('copy-imgs', ['clean-images', 'copy-imgs-jpg', 'copy-imgs-png']);


// --------------------------------------
// Tasks for CSS assets
// --------------------------------------
gulp.task('scss', () => {
  return gulp.src(`${config.scssSrcPath}/*.scss`) // Gets all files ending with .scss in application/scss
    .pipe(sass())
    .pipe(gulp.dest(`${config.distPath}/static/stylesheets`))
    .pipe(browserSync.reload({
        stream: true
    }))
});


// --------------------------------------
// Tasks for JS assets
// --------------------------------------

// do I need to include the babel polyfill on every page??
// can do from CDN
// https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.26.0/polyfill.min.js
gulp.task('babel', () =>
	gulp.src(`${config.jsSrcPath}/*.js`)
    .pipe(babel())
    .pipe(gulp.dest(`${config.distPath}/static/javascripts`))
    .pipe(browserSync.reload({
      stream: true
    }))
);

gulp.task('babel-min', () =>
	gulp.src(`${config.jsSrcPath}/*.js`)
    .pipe(babel())
    .pipe(uglify()) // optional
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${config.distPath}/static/javascripts`))
    .pipe(browserSync.reload({
      stream: true
    }))
);


// --------------------------------------
// Building pages
// --------------------------------------
gulp.task('nunjucks', () =>
  gulp.src(`application/templates/index.html`)
    .pipe(data((file) => JSON.parse(fs.readFileSync('application/data/data.json'))))
    .pipe(nunjucks.compile())
    .pipe(gulp.dest( config.distPath ))
    .pipe(browserSync.reload({
      stream: true
    }))
);

// .pipe(nunjucks.compile('.', { filters: {
//       'prettynumber': commaFilter,
//       'possession': possessionFilter
//     }}))


// --------------------------------------
// Task for development help
// --------------------------------------
gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: config.distPath
    },
  })
});

gulp.task('watch', ['browserSync', 'sass'], () => {
  gulp.watch(`${config.scssSrcPath}/**/*.scss`, ['scss']);
  gulp.watch([`${config.templatesPath}/index.html`, `${config.templatesPath}/*.njk`], ['nunjucks']); 
  gulp.watch(`${config.jsSrcPath}/*.js`, ['babel']);
  // Other watchers
});


// --------------------------------------
// Task sequences
// --------------------------------------
gulp.task('production', ['nunjucks', 'scss', 'babel-min', 'copy-imgs', 'copy-vendor-js']);
gulp.task('build', ['nunjucks', 'scss', 'babel']);
gulp.task('default', ['nunjucks', 'scss', 'babel', 'copy-imgs', 'copy-vendor-js']);
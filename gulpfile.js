'use strict'

// standard things
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');

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
const sassLint = require('gulp-sass-lint');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');


// --------------------------------------
// set paths
// --------------------------------------
const config = {
  distPath: 'dist',
  dataPath: 'application/data',
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

gulp.task('postcss', ['scss'], () => {
  // for debugging what prefixes will be set
  // console.log(autoprefixer().info());

  return gulp.src(`${config.distPath}/static/stylesheets/**/*.css`)
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(`${config.distPath}/static/stylesheets/post`));
});

gulp.task('clean:css', () => {
  return gulp.src(`${config.distPath}/static/stylesheets/*`, {read: false})
  .pipe(clean());
});

gulp.task('sass:lint', () => {
  return gulp.src(`${config.scssSrcPath}/**/*.s+(a|c)ss`)
    .pipe(sassLint({
      files: {ignore: `${config.scssSrcPath}/vendor/_mq.scss`},
      configFile: '.sass-lint.yml'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
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
  gulp.src(`${config.templatesPath}/**/*.html`)
    .pipe(data(getDataForFile))
    .pipe(nunjucks.compile('.', {}))
    .pipe(gulp.dest( config.distPath ))
    .pipe(browserSync.reload({
      stream: true
    }))
);

// .pipe(nunjucks.compile('.', { filters: {
//       'prettynumber': commaFilter,
//       'possession': possessionFilter
//     }}))
  // Load custom data for templates
function getDataForFile(file){

  var globals = null;
  var globals_json = `${config.dataPath}/globals.json`;
  if(fs.existsSync(globals_json)) {
    globals = JSON.parse(fs.readFileSync(globals_json, "utf8"));
  }

  var context = null
  var context_json = config.dataPath + "/" + path.basename(file.path.replace('.html', '.json'));
  if(fs.existsSync(context_json)) {
    context = JSON.parse(fs.readFileSync(context_json, "utf8"));
  }

  return {
    globals: globals,
    context: context
  }
}


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

gulp.task('watch', ['browserSync', 'postcss'], () => {
  gulp.watch(`${config.scssSrcPath}/**/*.scss`, ['postcss']);
  gulp.watch([`${config.templatesPath}/**/*.html`, `${config.templatesPath}/**/*.njk`], ['nunjucks']); 
  gulp.watch(`${config.jsSrcPath}/*.js`, ['babel']);
  // Other watchers
});


// --------------------------------------
// Task sequences
// --------------------------------------
gulp.task('production', ['nunjucks', 'postcss', 'babel-min', 'copy-imgs', 'copy-vendor-js']);
gulp.task('build', ['nunjucks', 'postcss', 'babel']);
gulp.task('default', ['nunjucks', 'postcss', 'babel', 'copy-imgs', 'copy-vendor-js']);
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var svgSprite = require('gulp-svg-sprite');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var minify = require('gulp-minify');
var babel = require("gulp-babel");
var tingpng = require('gulp-tinypng');
var browserSync = require('browser-sync');
var dist = {
    css: './css',
    cssmaps: './maps',
    img: './img',
    js: './js',
    jsmaps: './maps'
};

// Tinypng Api Key - 500 images limit per month - Get key here: https://tinypng.com/developers
const TINYPNG_API = "e9aSCEpvwKzzSFKRgEA9FxW11TUJJF2z";

// Handle the error
var onError = function(err) {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);
    this.emit('end');
};

// SVG Sprites
gulp.task('svg-sprite', function() {
  return gulp.src('./src/svg/*.svg')
    .pipe(plumber({errorHandler: onError}))
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '',
          prefix: '',
          sprite: 'spritemap'
        }
      }
    }))
    .pipe(gulp.dest(dist.img))
    .pipe(notify({ message: 'SVG task complete' }));
});

// CSS
gulp.task('styles', function () {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: ['last 2 versions', 'safari 6', 'ie 9', 'ios 7', 'android 4']
        }))
    .pipe(sourcemaps.write(dist.cssmaps))
    .pipe(gulp.dest(dist.css))
    .pipe(notify({ message: 'Styles task complete' }));
});

// JS - custom scripts
gulp.task('scripts', function() {
  return gulp.src('./src/js/scripts.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat('scripts.js'))
      .pipe(minify())
    .pipe(sourcemaps.write(dist.jsmaps))
    .pipe(gulp.dest(dist.js))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// JS - plugins
gulp.task('scripts-plugin', function() {
  return gulp.src('./src/js/plugins/*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(concat('plugins.js'))
      .pipe(minify())
    .pipe(sourcemaps.write(dist.jsmaps))
    .pipe(gulp.dest(dist.js))
    .pipe(notify({ message: 'Plugins task complete' }));
});

// Images
gulp.task('images', function() {
 return gulp.src('./src/img/**/*.{png,jpg,jpeg}')
   .pipe(plumber({errorHandler: onError}))
   .pipe(tingpng(TINYPNG_API))
   .pipe(gulp.dest(dist.img))
   .pipe(notify({ message: 'Image Task Completed: <%= file.relative %>' }));
});

// Copy files to dist
gulp.task('copyTask', function() {
  // JS library
  gulp.src('./src/js/lib/**/*')
    .pipe(gulp.dest('./js/lib'));
  // JS library
  gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('./fonts'));
});

// Browsersync task - Static server
gulp.task('serve', function() {
    browserSync.init(['css/*.css', 'js/*.js', '*.html'], {
        server: {
            baseDir: "./"
        }
    });
});

// Default Tasks
gulp.task('default', ['copyTask', 'styles', 'scripts', 'svg-sprite', 'scripts-plugin', 'images']);

// Watch tasks - gulp watch
gulp.task('watch', ['serve'], function() {

  // Watch .scss files
  gulp.watch('src/scss/**/*.scss', ['styles']);

  // Watch scripts.js files
  gulp.watch('src/js/scripts.js', ['scripts']);

  // Watch plugin .js files
  gulp.watch('src/js/plugins/*.js', ['scripts-plugin']);

  // Watch image files
  gulp.watch('src/img/**/*', ['images']);

  // Watch for .js library files
  gulp.watch('src/{js/lib/*.js,fonts/**/*}', ['copyTask']);

  // SVG files for spritemap
  gulp.watch('src/svg/*.svg', ['svg-sprite']);
});

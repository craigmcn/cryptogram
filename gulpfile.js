const gulp = require('gulp'),
  output = './dist'

// CSS
const sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer')

const sassOptions = {
  errLogToConsole: true,
  outputStyle: 'compact'
};

gulp.task('sass', done => {
  return gulp.src('./src/**/*.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(output))
  done()
});

// JS
const browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream')

gulp.task('js', done => {
  const b = browserify({
    entries: 'src/script.js',
    debug: false
  })

  return b.transform(babelify.configure({
    presets: ['@babel/preset-env'],
    sourceMaps: false
  }))
    .bundle()
    .pipe(source('script.js'))
    .pipe(gulp.dest(output))
  done()
});

gulp.task('build', gulp.parallel('js', 'sass'))
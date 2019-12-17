const gulp = require('gulp')
const gulpif = require('gulp-if')
const flatten = require('gulp-flatten')
const argv = require('minimist')(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
  development: './tmp',
  production: './dist'
}
const browserSync = require('browser-sync').create()

// CSS
const sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer')

  const sassOptions = {
    development: {
      errLogToConsole: true,
      outputStyle: 'expanded'
    },
    production: {
      errLogToConsole: false,
      outputStyle: 'compressed'
    }
  };
  

gulp.task('styles', done => {
  gulp.src('./src/styles/**/*.scss')
    .pipe(sass(sassOptions[env]).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(flatten())
    .pipe(gulp.dest(output[env]))
  done()
});

// JS
const browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify')

gulp.task('scripts', done => {
  const b = browserify({
    entries: 'src/scripts/index.js',
    debug: false
  })

  b.transform(babelify.configure({
    presets: ['@babel/preset-env'],
    sourceMaps: (env === 'production')
  }))
    .bundle()
    .pipe(source('scripts.js'))
    .pipe(gulpif(env === 'production', buffer()))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(flatten())
    .pipe(gulp.dest(output[env]))
  done()
});

// HTML
gulp.task('html', done => {
  gulp.src('./src/**/*.html')
    .pipe(gulp.dest(output[env]))
  done()
})

// Build
gulp.task('build', gulp.parallel('styles', 'scripts', 'html'))

// Reload browser
gulp.task('reload', done => {
  browserSync.reload()
  done()
})

// Browser sync
gulp.task('browserSync', () => {
  browserSync.init({
    server: './tmp'
  })
  gulp.watch(['src/styles/**/*.scss', 'src/scripts/**/*.js', 'src/**/*.html'], gulp.series('build', 'reload'))
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))

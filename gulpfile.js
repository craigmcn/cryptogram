const gulp = require('gulp')
const gulpif = require('gulp-if')
const flatten = require('gulp-flatten')
const argv = require('minimist')(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
  development: './tmp/cryptogram',
  production: './dist/cryptogram',
}
const browserSync = require('browser-sync').create()

// CSS
const sass = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer')

const sassOptions = {
  development: {
    errLogToConsole: true,
    outputStyle: 'expanded',
  },
  production: {
    errLogToConsole: false,
    outputStyle: 'compressed',
  },
}

gulp.task('styles', function () {
  return gulp
    .src('./src/styles/**/*.scss')
    .pipe(sass(sassOptions[env]).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(flatten())
    .pipe(gulp.dest(`${output[env]}/css`))
})

// JS
const browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify')

gulp.task('scripts', function () {
  const b = browserify({
    entries: 'src/scripts/index.js',
    debug: false,
  })

  return b
    .transform(
      babelify.configure({
        presets: ['@babel/preset-env'],
        sourceMaps: env === 'production',
      })
    )
    .bundle()
    .pipe(source('scripts.js'))
    .pipe(gulpif(env === 'production', buffer()))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(flatten())
    .pipe(gulp.dest(`${output[env]}/js`))
})

// Vendor
gulp.task('vendor-css', function () {
  return gulp
    .src(['./src/styles/albert.min.css'])
    .pipe(gulp.dest(`${output[env]}/css`))
})

// HTML
gulp.task('html', function () {
  return gulp
    .src(['./src/**/*.html', './src/site.webmanifest', './src/sw.js'])
    .pipe(gulp.dest(output[env]))
})

// Build
gulp.task('build', gulp.parallel('styles', 'scripts', 'vendor-css', 'html'))

// Reload browser
gulp.task('reload', (done) => {
  browserSync.reload()
  done()
})

// Browser sync
gulp.task('browserSync', () => {
  browserSync.init({
    port: 1237,
    server: './tmp',
    startPath: '/cryptogram/index.html',
    ui: false,
  })
  gulp.watch(
    [
      'src/styles/**/*.scss',
      'src/scripts/**/*.js',
      'src/**/*.html',
      './src/sw.js',
    ],
    gulp.series('build', 'reload')
  )
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))

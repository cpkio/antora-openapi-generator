let gulp = require('gulp');
let ts = require('gulp-typescript');
let concat = require('gulp-concat');
let tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
  return tsProject.src().pipe(tsProject())
    .on('error', () => {})
    .js.pipe(gulp.dest('build'));
});

gulp.task('merge', function () {
  return gulp.src(['./build/index.js', 'src/loader.js'])
    .pipe(concat('openapi-parser.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('loader', function () {
  return gulp.src(['src/openapi-include-processor.js'])
    .pipe(gulp.dest('dist'));
});

exports.default = gulp.series('build', 'merge', 'loader')

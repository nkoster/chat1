var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var gutil = require('gulp-util')

gulp.task('concat', () => {
  return gulp.src(['./js/jquery.min.js', './js/socket.io.js',
    './js/emoji.js', './js/chat.js', './js/drag.js'])
    .pipe(concat('chat.js'))
    .pipe(uglify())
    .on('error', (err) => {
      gutil.log(gutil.colors.red('[Error]'), err.toString())
     })
    .pipe(gulp.dest('./public/'))
})

gulp.task('watch:concat', () => {
  gulp.watch(['js/**/*', 'views/**/*'], gulp.parallel('concat'))
})

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

// gulp.task('js', function() {
//   gulp.src(['js/chat.js', 'js/drag.js'])
//     .pipe(concat('chat.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('public/'))
// });

// gulp.task('watch:js', ['js'], function() {
//   gulp.watch('js/**/*.js', ['js'])
// });

gulp.task('concat', function() {
return gulp.src(['./js/jquery.min.js', './js/socket.io.js', './js/chat.js', './js/drag.js'])
    .pipe(concat('chat.js'))
    .pipe(uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('./public/'))
});

gulp.task('watch:concat', ['concat'], function() {
  gulp.watch('js/**/*.js', ['js'])
});

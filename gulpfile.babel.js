import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import del from 'del';

const $ = gulpLoadPlugins();

gulp.task('build-js', () => {
  return gulp.src('src/**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest('built'));
});

gulp.task('browserify', () => {
  return browserify({
    entries: ['built/app.js']
  })
    .bundle()
    .pipe(source('boxrtc.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('clean-built', () => {
  return del(['built/*']);
});

gulp.task('webserver', () => {
  return gulp.src('./')
    .pipe($.webserver({
      host: '0.0.0.0',
      livereload: {
        enable: true,
        filter: function(fileName) {
          switch (fileName.substr(__dirname.length + 1)) {
            case 'index.html':
            case 'boxrtc.js':
              return true;
          }
          return false;
        }
      },
      open: true
    }));
});

gulp.task('build', gulp.series('clean-built', 'build-js', 'browserify'));

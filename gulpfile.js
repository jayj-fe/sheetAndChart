const gulp = require("gulp");
const uglify = require("gulp-uglify");
const clean = require("gulp-clean");
const babelify = require("babelify");
const bro = require("gulp-bro");
const webserver = require("gulp-webserver");
const rename = require('gulp-rename');

const paths = {
  dist : ["dist"],
  src : ["src"]
}

// dist clean
gulp.task('clean', async function () {
  gulp.src(paths.dist, {allowEmpty:true})
    .pipe(clean({force: true}));
});

// babel
gulp.task("babel", function () {
  return gulp.src(`${paths.src}/*.js`)
    .pipe(bro({
      transform: [ babelify.configure({ presets: ["@babel/preset-env"] }) ],
    }))
    .pipe(uglify()) // minify
    .pipe(rename(function (p) {
      p.basename += '.min';
    }))
    .pipe(gulp.dest(paths.dist));
});

// webserver
gulp.task("webserver", function(){
  gulp.src(paths.dist)
    .pipe(
      webserver({
        port: 5000,
        livereload: true,
        open: true,
      })
    );
});

// webserver
gulp.task("src-webserver", function(){
  gulp.src(paths.src)
    .pipe(
      webserver({
        port: 5000,
        livereload: true,
        open: true,
      })
    );
});

// watch
gulp.task("watch", function(){
  gulp.watch(paths.src, gulp.series("babel", "webserver"));
});
// watch
gulp.task("src-watch", function(){
  gulp.watch(paths.src, gulp.series("babel", "src-webserver"));
});

gulp.task("dev", gulp.series("babel", "src-webserver", "src-watch"));
gulp.task("default", gulp.series("babel", "webserver", "watch"));

// gulp.task('default', gulp.series('uglify'));

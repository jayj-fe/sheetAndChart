const gulp = require("gulp");
const clean = require('gulp-clean');
const bro = require("gulp-bro");
const babelify = require("babelify");
const uglify = require("gulp-uglify");
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const webserver = require("gulp-webserver");

const paths = {
  dist : ["docs"],
  src : ["src"]
}

gulp.task("clean", function () {
  return gulp.src([`${paths.dist}/js`, `${paths.dist}/css`], {allowEmpty:true})
    .pipe(clean());
});

// babel
gulp.task("babel", function () {
  return gulp.src("src/*.js")
    .pipe(bro({
      transform: [ babelify.configure({ presets: ["@babel/preset-env"] }) ],
    }))
    .pipe(uglify()) // minify
    .pipe(rename(function (p) {
      p.basename += '.min';
    }))
    .pipe(gulp.dest(`${paths.dist}/js`));
});

gulp.task("sass", function(){
  return gulp.src(`${paths.src}/*.scss`)
    .pipe(sass())
    .pipe(gulp.dest(`${paths.dist}/css`));
})

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

// watch
gulp.task("watch", function(){
  gulp.watch(`${paths.src}/*`, gulp.series("clean", "babel", "sass"));
});

gulp.task("default", gulp.parallel("clean", "babel", "sass", "webserver", "watch"));
var argv = require('yargs').argv;
var target = argv.t;
if (target == null) {
   console.log('add --t [target]')
   return
}

var jsSrc = 'src/'+target+'/js/*.js',
    cssSrc = 'src/'+target+'/css/*.css',
    imgSrc = 'src/'+target+'/img/*',
    destDir = 'src/'+target+'/',
    distDir = 'dist';

var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del'),
    webpack = require('gulp-webpack'),
    qn = require('gulp-qn'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector');

var config = {
  entry: 'src/constellation/js/app/',
  output: {
    path: __dirname + destDir,
    filename: "app.js"
  }
};

var qiniu = {
  accessKey: 'access_key',
  secretKey: 'secret_key',
  bucket: 'bucket',
  domain: 'domain'
};

gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js');
});

gulp.task('publish', ['clean'], function () {
  gulp.start('publish-css', 'publish-js', 'publish-html', 'publish-img');
});

gulp.task('watch', function () {
  gulp.watch(cssSrc, ['css']);
  gulp.watch(jsSrc, ['js']);
});

gulp.task('clean', function() {
  del(distDir)
});

gulp.task('js', function() {
  gulp.src(jsSrc)
    .pipe(concat('peiwo.js'))
    .pipe(gulp.dest(destDir));
});

gulp.task('css', function() {
  gulp.src(cssSrc)
    .pipe(concat('peiwo.css'))
    .pipe(gulp.dest(destDir));
});

gulp.task('publish-js', function() {
  gulp.src(jsSrc)
    .pipe(concat('peiwo.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(rev())
    .pipe(gulp.dest(distDir))
    .pipe(qn({
      qiniu: qiniu,
      prefix: target+'/'
    }))
    .pipe(rev.manifest())
    .pipe(gulp.dest(distDir+'/rev/js'));
});

gulp.task('publish-img', function() {
  gulp.src(imgSrc)
    .pipe(qn({
      qiniu: qiniu,
      prefix: target+'/img/'
    }));
});

gulp.task('publish-css', function() {
  gulp.src(cssSrc)
    .pipe(concat('peiwo.css'))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    .pipe(rev())
    .pipe(gulp.dest(distDir))
    .pipe(qn({
      qiniu: qiniu,
      prefix: target+'/'
    }))
    .pipe(rev.manifest())
    .pipe(gulp.dest(distDir+'/rev/css'));
});


gulp.task('publish-html', function () {
  return gulp.src([distDir+'/rev/**/*.json', destDir+'/*.html'])
    .pipe(revCollector({
      replaceReved: true
    }))
    .pipe(gulp.dest(distDir));
});

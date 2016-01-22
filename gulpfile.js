var fs = require('fs'),
    gulp = require('gulp'),
    clean = require('gulp-clean'),
    babel = require('gulp-babel'),
    jscs = require('gulp-jscs'),
    eslint = require('gulp-eslint'),
    esdoc = require('gulp-esdoc'),
    ghPages = require('gulp-gh-pages');

const SRC_PATH = './src/**/*.es6';

gulp.task('clean-jsdoc', function() {
    return gulp.src('./jsdoc', {read: false}).pipe(clean());
});

gulp.task('clean-lib', function() {
    return gulp.src('./lib', {read: false}).pipe(clean());
});

gulp.task('eslint', function() {
    return gulp.src(SRC_PATH)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('jscs', function() {
    return gulp.src(SRC_PATH).pipe(jscs({configPath: './.jscs.js', esnext: true}));
});

gulp.task('lint', ['eslint', 'jscs']);

gulp.task('compile', ['clean-lib'], function() {
    return gulp.src(SRC_PATH)
        .pipe(babel({optional: 'runtime'}))
        .pipe(gulp.dest('lib'));
});

gulp.task('esdoc', ['clean-jsdoc'], function() {
    var esdocConfig = fs.readFileSync('./esdoc.json', 'utf-8');
    esdocConfig = JSON.parse(esdocConfig);
    gulp.src('./src')
        .pipe(esdoc(esdocConfig));
});

gulp.task('copy-logo', ['esdoc'], function() {
    return gulp.src('./logo.jpg').pipe(gulp.dest('./jsdoc'));
});

gulp.task('ghPages', ['esdoc', 'copy-logo'], function() {
    return gulp.src('./jsdoc/**/*').pipe(ghPages());
});

gulp.task('publish-doc', ['esdoc', 'copy-logo', 'ghPages']);

gulp.task('watch', function() {
    gulp.watch(SRC_PATH, ['compile']);
});

'use strict';

var gulp = require('gulp');
var prefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cssmin = require('gulp-minify-css');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var watch = require('gulp-watch');
var browserSync = require("browser-sync");
var reload = browserSync.reload;

var coffee = require('gulp-coffee');
var stylus = require('gulp-stylus');
var es = require('event-stream');
var concat = require('gulp-concat');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/*.js',
        coffee: 'src/js/*.coffee',
        // style: 'src/css/main.scss',
        style: 'src/css/main.styl',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        coffee: 'src/js/**/*.coffee',
        style: 'src/css/**/*.styl',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    }
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Front-end"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        // .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {

    var jsFromCoffeeScript = gulp.src(path.src.coffee)
    .pipe(coffee());
    var jsLibraries = gulp.src(['src/js/lib-jquery-2.1.4.js','src/js/lib-framework.js']);
    var js = gulp.src([path.src.js, '!src/js/lib*.js']);

    return es.merge(jsLibraries, jsFromCoffeeScript, js)
        .pipe(sourcemaps.init())
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.coffee], function(event, cb) {
        gulp.start('js:build');
    })
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch'])

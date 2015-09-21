/*jslint node: true */

(function () {
    
    'use strict';

    var gulp = require('gulp'),
        rimraf = require('rimraf'),
        browserify = require('browserify'),
        ractivate = require('ractivate'),
        buffer = require('vinyl-buffer'),
        source = require('vinyl-source-stream'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        less = require('gulp-less'),
        cssBase64 = require('gulp-css-base64'),
        svgSymbols = require('gulp-svg-symbols'),
        jade = require('gulp-jade'),
        watch = require("gulp-watch"),
        browserSync = require("browser-sync"),
        reload = browserSync.reload,
        
        path = {
            build: {
                html:   'build/',
                js:     'build/js/',
                jsFile: 'app.js',
                css:    'build/css/',
                img:    'build/img/',
                svg:    'src/img/',
                fonts:  'build/fonts/'
            },
            src: {
                html:   'src/*.jade',
                js:     'src/js/app.js',
                style:  'src/style/common.less',
                img:    'src/img/**/*.*',
                svg:    'src/img/svg-symbols/*.svg',
                fonts:  'src/fonts/**/*.*'
            },
            watch: {
                html:   'src/**/*.jade',
                js:     'src/js/**/*.*',
                style:  'src/style/**/*.less',
                img:    'src/img/**/*.*',
                fonts:  'src/fonts/**/*.*'
            },
            clean: 'build/'
        },
        sercerConfig = {
            server: {
                baseDir: "./build"
            },
            tunnel: false,
            host: 'localhost',
            port: 9000,
            logPrefix: "Ject_Devil"
        };

    gulp.task('default', [
        'build',
        'webserver',
        'watch'
    ]);
    
    gulp.task('build', [
        'build-html',
        'build-js',
        'build-css',
        'build-svg',
        'build-img',
        'build-fonts'
    ]);
    
    gulp.task('clean', function (cb) {
        rimraf(path.clean, cb);
    });

    gulp.task('build-html', function () {
        gulp.src(path.src.html)
            .pipe(jade({
                pretty: true
            }))
            .pipe(gulp.dest(path.build.html))
            .pipe(reload({stream: true}));
    });
    
    gulp.task('build-js', function () {
        browserify(path.src.js)
            .transform({extensions: ['.html']}, ractivate)
            .bundle()
            .pipe(source(path.build.jsFile))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(path.build.js))
            .pipe(reload({stream: true}));
    });
    
    gulp.task('build-css', function () {
        gulp.src(path.src.style)
            .pipe(less())
            .pipe(cssBase64({
                baseDir: './',
                extensionsAllowed: ['.gif', '.jpg', '.png', '.svg']
            }))
            .pipe(gulp.dest(path.build.css))
            .pipe(reload({stream: true}));
    });
    
    gulp.task('build-img', function () {
        gulp.src(path.src.img)
            .pipe(gulp.dest(path.build.img));
    });
    
    gulp.task('build-svg', function () {
        gulp.src(path.src.svg)
            .pipe(svgSymbols({
                title: false,
                id: 'svg-symbol-%f',
                className: '.svg-symbol-%f'
            }))
            .pipe(gulp.dest(path.build.svg));
    });

    gulp.task('build-fonts', function () {
        gulp.src(path.src.fonts)
            .pipe(gulp.dest(path.build.fonts));
    });
    
    gulp.task('webserver', function () {
        browserSync(sercerConfig);
    });
    
    gulp.task('watch', function () {
        watch([path.watch.html], function (event, cb) {
            gulp.start('build-html');
        });
        watch([path.watch.style], function (event, cb) {
            gulp.start('build-css');
        });
        watch([path.watch.js], function (event, cb) {
            gulp.start('build-js');
        });
        watch([path.watch.img], function (event, cb) {
            gulp.start('build-img');
        });
        watch([path.watch.fonts], function (event, cb) {
            gulp.start('build-fonts');
        });
    });


}());

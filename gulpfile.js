/* Config settings - Update this when you clone the repo */
var repo = {
	remoteUrl: "https://github.com/HackTJ/checkin.git",
	branch: "gh-pages",
	cacheDir: '.page'
}
/* ----------------------------------------------------- */

var concat = require('gulp-concat');
var githubPages = require("gulp-gh-pages");
var gulp = require('gulp');
var http = require('node-static');
var jade = require('gulp-jade');
var minifyIMG = require('gulp-imagemin')
var minifyJS = require('gulp-uglify')
var rmdir = require('rimraf');
var sass = require('gulp-sass');
var when = require('when');
var livereload = require('gulp-livereload');


/**** Compiler tasks ****/
var compiler = {};

// Clean /out directory
compiler.clean = function(cb) {
	rmdir('./out/**/*', function(){
		console.log('done cleaning')
		return cb();
	});
}

// Compile HTML
compiler.html = function() {
	console.log('Compiling HTML...');
	var deferred = when.defer();
    gulp.src('./jade/[!_]*.jade')
        .pipe(jade())
        .pipe(gulp.dest('./out'))
        .pipe(livereload())
        .on('end', function(){
        	deferred.resolve();
        });
    return deferred.promise;
}

// Compile CSS
compiler.css = function() {
	console.log('Compiling CSS...');
	var deferred = when.defer()
    gulp.src('./scss/[!_]*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest('./out/css'))
        .pipe(livereload())
        .on('end', function(){
        	deferred.resolve();
        });
    return deferred.promise;
}

// Compile JS
compiler.js = function() {
	console.log('Compiling JS...');
	var deferred = when.defer();
    gulp.src(['./js/_*.js', './js/*.js'])
        .pipe(concat('main.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest('./out/js'))
        .on('end', function(){
        	deferred.resolve();
        });
    return deferred.promise;
}

// Compile static resources
compiler.static = function(){
	console.log('Compiling static...');
    var deferred = when.defer();
    gulp.src('./static/**')
        .pipe(gulp.dest('./out'))
        .on('end', function(){
        	deferred.resolve();
        });
    return deferred.promise;
}

// Add gulp tasks for each compiler
Object.keys(compiler).forEach(function(name){
	gulp.task(name, compiler[name]);
})

// Clear directory and compile all
var compileAll = function(cb){
	when.all([
		compiler.html(),
		compiler.css(),
		compiler.js(),
		compiler.static()
	]).then(function(stuff){
		console.log("Compiled all files.")
		return cb();
	});
}
gulp.task('compile', ['clean'], compileAll)


/**** Deploy tasks ****/
var deploy = {}

gulp.task('deploy', ['compile'], function(){
	var deferred = when.defer();
	gulp.src("./out/**/*")
        .pipe( githubPages( repo ) )
        .on('end', function(){
        	deferred.resolve();
        });
    return deferred.promise;
});


gulp.task('watch', ['default'], function() {
    livereload.listen();

    port = (process.argv.length > 4 && process.argv[3] == '--port') ? parseInt(process.argv[4]) : 8000;
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            new http.Server('./out').serve(request, response);
        }).resume();
    }).listen(port);

    gulp.watch('./static/**', ['static']);
    gulp.watch('./scss/**/*.scss', ['css']);
    gulp.watch('./js/**/*.js', ['js'])
    gulp.watch('./jade/*.jade', ['html']);

    console.log("Server listening on port %s", port)
});

gulp.task('default', ['compile'])

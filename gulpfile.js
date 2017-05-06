const
	gulp = require("gulp"),
	sync = require("browser-sync").create(),
	plugins = require("gulp-load-plugins")({
		scope: ["devDependencies"]
	}),
	swallowError = function() {
		return plugins.plumber(function(error) {
			console.error("ERROR: " + error.message);
			this.emit('end');
		});
	},

	IS_DEVELOPMENT = true,
	DIST_DIR = "dist",
	CSS_DIST_DIR = DIST_DIR + "/css",
	JS_DIST_DIR = DIST_DIR + "/js",
	FONTS_DIST_DIR = DIST_DIR + "/fonts",
	IMAGES_DIST_DIR = DIST_DIR + "/images";

gulp.task("html", function () {
	return gulp.src("src/*.html")
		.pipe(gulp.dest(DIST_DIR));
});

gulp.task("css:app", function () {
	return gulp.src("src/styles/app.less")
		.pipe(swallowError())
		.pipe(plugins.if(IS_DEVELOPMENT, plugins.sourcemaps.init()))
		.pipe(plugins.less())
		.pipe(plugins.cssnano())
		.pipe(plugins.rename({suffix: ".min"}))
		.pipe(plugins.if(IS_DEVELOPMENT, plugins.sourcemaps.write()))
		.pipe(gulp.dest(CSS_DIST_DIR))
		.pipe(sync.stream());
});

gulp.task("css:vendor", function () {
	return gulp.src([
		"node_modules/bootstrap/dist/css/bootstrap.css",
		"node_modules/normalize.css/normalize.css",
		"node_modules/font-awesome/css/font-awesome.css"
	])
		.pipe(swallowError())
		.pipe(plugins.if(IS_DEVELOPMENT, plugins.sourcemaps.init()))
		.pipe(plugins.if(!IS_DEVELOPMENT, plugins.cssnano()))
		.pipe(plugins.concat("vendor.min.css"))
		.pipe(plugins.if(IS_DEVELOPMENT, plugins.sourcemaps.write()))
		.pipe(gulp.dest(CSS_DIST_DIR))
		.pipe(sync.stream());
});

gulp.task("js:vendor", function() {
	return gulp.src([
		"node_modules/jquery/dist/jquery.js",
		"node_modules/bootstrap/dist/js/bootstrap.js",
		"src/resources/js/*.js"
	])
		.pipe(swallowError())
		.pipe(plugins.if(IS_DEVELOPMENT, plugins.sourcemaps.init()))
		.pipe(plugins.concat("vendor.min.js"))
		.pipe(plugins.if(!IS_DEVELOPMENT, plugins.uglify()))
		.pipe(plugins.if(IS_DEVELOPMENT, plugins.sourcemaps.write()))
		.pipe(gulp.dest(JS_DIST_DIR));
});

gulp.task("fonts:app", function() {
	return gulp.src([
		"src/fonts/*"
	])
		.pipe(swallowError())
		.pipe(gulp.dest(FONTS_DIST_DIR));
});

gulp.task("fonts:vendor", function() {
	return gulp.src([
		"node_modules/bootstrap/dist/fonts/*",
		"node_modules/bootstrap/dist/fonts/*",
		"node_modules/font-awesome/fonts/*"
	])
		.pipe(swallowError())
		.pipe(gulp.dest(FONTS_DIST_DIR));
});

gulp.task("images:app", function() {
	return gulp.src([
		"src/images/**/*.*"
	])
		.pipe(swallowError())
		.pipe(plugins.if(!IS_DEVELOPMENT, plugins.imagemin()))
		.pipe(gulp.dest(IMAGES_DIST_DIR));
});

gulp.task("css", ["css:app", "css:vendor"]);
gulp.task("js", ["js:vendor"]);
gulp.task("assets", ["fonts:app", "fonts:vendor", "images:app"]);

gulp.task("build", ["html", "js", "css", "assets"]);

gulp.task("watch", ["build"], function () {
	sync.init({
		server: DIST_DIR
	});

	gulp.watch("src/images/**/*.*", ["images:app"]);
	gulp.watch("src/fonts/**/*.*", ["fonts:app"]);
	gulp.watch("src/**/*.html", ["html"]);
	gulp.watch("src/styles/**/*.less", ["css:app"]);
	gulp.watch("src/scripts/*.coffee", ["js:app"]);

	gulp.watch(DIST_DIR + "/*.html").on("change", sync.reload);
	gulp.watch(JS_DIST_DIR + "/*.js").on("change", sync.reload);
});

gulp.task("default", ["build", "watch"]);
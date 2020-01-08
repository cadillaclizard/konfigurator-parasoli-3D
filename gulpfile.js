var gulp = require("gulp");
var config = require("./gulp.config")();
var $ = require("gulp-load-plugins")();

gulp.task("dev", ["clean"], function() {
	// JS
	$.watch(config.src.js, { ignoreInitial: false, read: false }, $.batch(compileJs));

	// SCSS
	$.watch(config.src.scss, { ignoreInitial: false, read: false }, $.batch(compileSass));

	// lib
	$.watch(config.src.vendorsJs, { ignoreInitial: false, read: false }, $.batch(compileVendorsJs));
	$.watch(config.src.vendorsCss, { ignoreInitial: false, read: false }, $.batch(compileVendorsCss));

	// STATIC
	$.watch(config.src.static, { ignoreInitial: false })
		.pipe(gulp.dest(config.bin.static));

	// TPL
	$.watch(config.src.tpl, { ignoreInitial: false, read: false }, $.batch(compileTpl));

	// INJECT
	$.watch([config.binPath, "!./**/*.html"], { ignoreInitial: false, read: false, events: ["add", "unlink"] }, $.batch(injectHtml));
	$.watch("./index.tpl.html", { read: false }, $.batch(injectHtml));
});

gulp.task("clean", function() {
	return gulp.src([config.binPath, "./index.html"], { read: false })
		.pipe($.clean());
})

function compileTpl() {
	return gulp.src(config.src.tpl)
		.pipe($.angularTemplatecache("templates.js", { module: "app" }))
		.pipe(gulp.dest(config.bin.js))
		.pipe($.util.log("Compiled TPL"));
}

function injectHtml() {
	return gulp.src("./index.tpl.html")
		.pipe($.inject(gulp.src(config.bin.scripts, { read: false }), { relative: true, addRootSlash: false }))
		.pipe($.inject(gulp.src(config.bin.styles, { read: false }), { relative: true, addRootSlash: false }))
		.pipe($.rename("index.html"))
		.pipe(gulp.dest("./"))
		.pipe($.util.log("Compiled html"));
}

function compileJs() {
	return gulp.src(config.src.js)
		//.pipe($.sourcemaps.init())
		.pipe($.concat("app.min.js"))
		//.pipe($.sourcemaps.write())
		.pipe(gulp.dest(config.bin.js))
		.pipe($.util.log("Compiled JS"));
}

function compileVendorsJs() {
	return gulp.src(config.src.vendorsJs)
	.pipe($.uglify())
		.pipe($.concat("lib.min.js"))
		.pipe(gulp.dest(config.bin.js))
		.pipe($.util.log("Compiled Vendors JS"));
}

function compileVendorsCss() {
	return gulp.src(config.src.vendorsCss)
		.pipe($.autoprefixer({ browsers: ["> 1%", "last 30 versions"] }))
		.pipe($.concat("lib.min.css"))
		.pipe($.cleanCss())
		.pipe(gulp.dest(config.bin.css))
		.pipe($.util.log("Compiled Vendors CSS"));
}

function compileSass() {
	return gulp.src(config.src.scss)
		.pipe($.plumber())
		.pipe($.sass.sync({ includePaths: config.sassInclude }))
		.pipe($.autoprefixer({ browsers: ["> 1%", "last 30 versions"] }))
		.pipe($.concat("styles.min.css"))
		.pipe($.cleanCss())
		.pipe(gulp.dest(config.bin.css))
		.pipe($.util.log("Compiled SASS"));
}

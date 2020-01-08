var root = "./";
var src = root + "app/";
var bin = root + "bin/";

var srcPaths = {
	js: src + "**/*.js",
	vendorsJs: [
		root + "vendors/jquery-3.1.1.js",
		root + "vendors/three.js",
		root + "vendors/angular.js",
		root + "vendors/angular-ui-router.js",
		root + "vendors/angular-animate.js",
		root + "vendors/*.js"
	],
	vendorsCss: root + "vendors/*.css",
	scss: src + "**/*.scss",
	tpl: src + "**/*.html",
	static: root + "img/**/*.*"
};

var binPaths = {
	js: bin + "js/",
	scripts: [
		bin + "js/lib.min.js",
		bin + "js/app.min.js",
		bin + "js/**/*.js"
	],
	css: bin + "css/",
	styles: [
		bin + "css/**/*.css",
		bin + "vendors/*.css",
	],
	tpl: bin + "tpl/",
	static: bin + "img/",
	vendors: bin + "/vendors/",
	vendorsFiles: bin + "/vendors/**/*.*"
}

module.exports = function() {
	return {
		binPath: bin,
		srcPath: src,
		src: srcPaths,
		bin: binPaths,
		sassInclude: src
	}
}
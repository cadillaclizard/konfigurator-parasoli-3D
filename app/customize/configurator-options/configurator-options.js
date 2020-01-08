app.directive("configuratorOptions", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "customize/configurator-options/configurator-options.html",
		controllerAs: "vm",
		controller: "configuratorOptionsController"
	}
});

app.controller("configuratorOptionsController", function() {
	this.selectedMenu = "images";
});
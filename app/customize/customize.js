app.directive("customize", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "customize/customize.html",
		controllerAs: "vm",
		controller: "customizeController"
	}
});

app.controller("customizeController", ["appService", "$state", "$scope", function(appService, $state, $scope) {
	if (!appService.getModel()) {
		$state.go("select-model");
	}

	var vm = this;
	appService.showWarning().take(1).subscribeOnNext(function() {
		$scope.$evalAsync(function() { 
			vm.showWarning = true;
		})
	});

	$(document).keyup(function(e) {
		if (e.originalEvent.keyCode === 13) {
			$scope.$evalAsync(function() { vm.showWarning = false; });
		}
		if (e.originalEvent.keyCode === 27) {
			$scope.$evalAsync(function() { vm.showWarning = false; });
		}
	});
}]);
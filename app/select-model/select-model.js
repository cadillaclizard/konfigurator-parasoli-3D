app.directive("selectModel", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "select-model/select-model.html",
		controllerAs: "vm",
		controller: "selectModelController"
	}
});

app.controller("selectModelController", ["$rootScope", "$scope", "appService", "$state", function($rootScope, $scope, appService, $state) {
	var vm = this;

	vm.appService = appService;
	
	appService.getModels().then(function(result) {
		$scope.$evalAsync(function() { vm.models = result.data; })
	});

	$(document).keyup(function(e) {		
		if (e.originalEvent.keyCode === 13) {
			vm.appService.setModel(vm.selectedModel);
			$state.go("customize");
		}
		if (e.originalEvent.keyCode === 27) {
			$scope.$evalAsync(function() {
				vm.selectedModel = null
			});
		}
	});

	vm.goToPreview = function() {
		if (!vm.previewId) return;

		$state.go("preview", { id: vm.previewId });
	}
}]);
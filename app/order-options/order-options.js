app.directive("orderOptions", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "order-options/order-options.html",
		controllerAs: "vm",
		controller: "orderOptionsController"
	}
});

app.controller("orderOptionsController", ["$scope", "$state", "appService", function($scope, $state, appService) {
	if (!(this.model = appService.getModel())) {
		$state.go("select-model");
	}

	var vm = this;
	vm.deliveryOptions = {
		count: 1,
		baseCount: 1,
		base: null,
		delivery: "personal"
	}

	appService.orderOptions.take(1)
		.subscribeOnNext(deliveryOptions => {
			$scope.$evalAsync(function() { vm.deliveryOptions = deliveryOptions });
		});

	$scope.$watch("vm.deliveryOptions.count", function(newValue) {
		vm.deliveryOptions.count = Math.min(Math.max(1, newValue), 10);
	});

	$scope.$watch("vm.deliveryOptions.base", function(newValue) {
		if (!!newValue) {
			vm.deliveryOptions.baseCount = vm.deliveryOptions.baseCount || 1;
		} else {
			vm.deliveryOptions.baseCount = 0;
		}
	});


	$scope.$watch("vm.deliveryOptions.baseCount", function(newValue) {
		if (newValue < 1) {
			vm.deliveryOptions.base = null;
		}
		vm.deliveryOptions.baseCount = Math.min(Math.max(0, newValue), 10);
	});

	$scope.$watch("vm.deliveryOptions", function(newValue) {
		appService.orderOptions.onNext(newValue);
	}, true);
}]);
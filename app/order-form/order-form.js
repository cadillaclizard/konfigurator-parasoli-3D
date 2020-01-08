app.directive("orderForm", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "order-form/order-form.html",
		controllerAs: "vm",
		controller: "orderFormController"
	}
});

app.controller("orderFormController", ["$state", "$scope", "appService", "$element", function($state, $scope, appService, $element) {
	if (!appService.getModel()) {
		$state.go("select-model");
	}

	var vm = this;
	vm.orderForm = {
		invoice: false,
		additionalFiles: []
	};

	appService.orderOptions.take(1)
		.subscribeOnNext(function(orderOptions) { vm.orderOptions = orderOptions; });

	appService.orderForm.take(1)
		.subscribeOnNext(function(orderForm) { vm.orderForm = orderForm; });

	$scope.$watch("vm.orderForm", function(newValue) {
		appService.orderForm.onNext(newValue);
	}, true);

	this.deleteFile = function(index) {
		vm.orderForm.additionalFiles.splice(index, 1);
	}

	this.confirmOrder = function() {
		for (var errorArray in $scope.form.$error) {
			_.forEach($scope.form.$error[errorArray], function(formElement) {
				formElement.$setDirty();
			});
		}

		if ($scope.form.$valid) {
			$state.go("summary");
		}
	};
	
	$element.find("#additional-files").bind("change", function(changeEvent) {
		var files = $.extend({}, changeEvent.target.files);
		changeEvent.target.value = "";

		_.forEach(files, function(file) {
			var reader = new FileReader();
			reader.onload = function(readerEvent) {
				var base64 = readerEvent.target.result;
				$scope.$evalAsync(function() {
					vm.orderForm.additionalFiles.push({
						base64: base64,
						name: file.name
					})
				});
			};
			reader.readAsDataURL(file);
		});
	});
}]);
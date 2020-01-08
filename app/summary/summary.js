app.directive("summary", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "summary/summary.html",
		controllerAs: "vm",
		controller: "summaryController"
	}
});

app.controller("summaryController", ["$rootScope", "$scope", "$state", "appService", "priceService", "$http", function($rootScope, $scope, $state, appService, priceService, $http) {
	if (!(this.model = appService.getModel())) {
		$state.go("select-model");
	}

	var vm = this;
	vm.priceService = priceService;
	vm.images = appService.getImages();

	appService.orderForm.take(1)
		.subscribeOnNext(function(orderForm) {
			vm.orderForm = orderForm;
			vm.imagesIsEmpty = _.isEmpty(vm.images) && _.isEmpty(vm.orderForm.additionalFiles);
		});

	appService.orderOptions.take(1)
		.subscribeOnNext(function(orderOptions) { vm.orderOptions = orderOptions; });

	vm.submitOrder = function() {
		if (!vm.acceptRules) return;

		var discountPrice = priceService.getFullPrice(1).toFixed(2);
		var discountPriceBrutto = priceService.getFullPrice(1.23).toFixed(2);
		var discount = 1 - priceService.getDiscount()
		
		var submitModel = {
			model: vm.model,
			orderForm: vm.orderForm,
			orderOptions: vm.orderOptions,
			prices: {
				total: parseFloat(discountPrice / discount).toFixed(2),
				discount: priceService.getDiscount(),
				netto: discountPrice,
				brutto: discountPriceBrutto,
				delivery: priceService.getDeliveryPrice(),
			},
			images: []
		};

		var prices = {
			delivery: priceService.getDeliveryPrice(),
			fullPrice: priceService.getFullPrice(1).toFixed(2),
			fullPriceVat: priceService.getFullPrice(1.23).toFixed(2)
		}

		_.forEach(vm.images, function(image) {
			image.decal = _.omit(image.decal, ["items", "material"]);
			submitModel.images.push(image);
		});

		$state.go("confirmation", { submitModel: submitModel, previewId: "#mock-id", prices: prices });
		return;

		var req = {
			method: 'POST',
			url: 'http://dev.lithium.pl/perfecta/wp/wp-admin/admin-ajax.php',
			data: $.param({
				action: "createOrder",
				order: submitModel
			}),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}

		vm.sendingRequest = true;
		$http(req).then(function(response) {
			console.log("Kod:" + response.data.guild);

			$state.go("confirmation", {
				submitModel: submitModel,
				previewId: response.data.guild,
				prices: prices
			});
		}, function(err){
			alert("Coś poszło nie tak");
			console.log(err);
			$scope.$evalAsync(function() { vm.sendingRequest = false; });
		});
	}

	vm.submitDiscount = function() {
		if (!vm.discountCode) return;

		var req = {
			method: 'POST',
			url: 'http://dev.lithium.pl/perfecta/wp/wp-admin/admin-ajax.php',
			data: $.param({
				action: "getDiscount",
				discount: vm.discountCode
			}),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}

		$http(req).then(
			function(response){
				$scope.$evalAsync(function() {
					vm.discountResult = response.data;
					$rootScope.$broadcast("discount-added", vm.discountResult);
					vm.discountCode = "";
				});
			},
			function(err){
				$scope.$evalAsync(function() {
					vm.discountResult = false;
					$rootScope.$broadcast("discount-added", 0);
				})
				console.log(err);
			}
		);
	}
}])

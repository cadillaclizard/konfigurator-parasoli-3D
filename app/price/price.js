app.directive("price", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "price/price.html",
		controllerAs: "vm",
		controller: "priceController"
	}
});

app.controller("priceController", ["$rootScope", "$scope", "appService", "priceService", "$element", function($rootScope, $scope, appService, priceService, $element) {
	var selectedModel, orderOptions, gotImages = false, customColor = false, discount = 0;
	var vm = this;
	vm.price = 0;

	$rootScope.$on("model-selected", function(event, model) {
		selectedModel = model;
		count();
	});

	$rootScope.$on("decal-image-added", function(event) {
		gotImages = true;
		count();
	});

	$rootScope.$on("decal-image-removed", function(event) {
		var images = appService.getImages();

		if ($.isEmptyObject(images)) {
			gotImages = false;
			count();
		}
	});

	$rootScope.$on("model-color-changed", function(event, color) {
		customColor = !color.paleteNo;
		count();
	});

	$rootScope.$on("discount-added", function(event, value) {
		discount = value;
		priceService.setDiscount(discount);
		count();
	});

	appService.orderOptions.subscribeOnNext(function(options) {
		orderOptions = options;
		count();
	});

	function count() {
		var price = 0;

		if (!!selectedModel) {
			var count = !!orderOptions ? orderOptions.count : 1;
			var orderTier = !!orderOptions && orderOptions.count > 2 ? 1 : 0;

			price = selectedModel.price.base[orderTier];

			if (gotImages || customColor) { // zwiększ cene za zadruk
				price += price * selectedModel.price.print[orderTier];
			}

			priceService.setModelPrice(price);

			price = price * count; // zwiększ cene za ilość

			if (!!orderOptions && !!orderOptions.base) { // dodaj cenę za podstawę
				price += orderOptions.base.price * orderOptions.baseCount;
			}
			
			price -= price * discount;

			var delivery = 0;

			if (!!orderOptions && orderOptions.delivery == "poland") { // dodaj cenę za dostawę
				delivery = selectedModel.price.delivery[orderTier];
				price += delivery;
			}
		}

		priceService.setDeliveryPrice(delivery);
		priceService.setFullPrice(price);
		$scope.$evalAsync(function() {
			if (vm.price != price) {
				vm.price = price;
				vm.animate();
			}
		});
	}

	this.animate = function() {
		var elem = $element.find("span:last-of-type");
		elem.addClass("bounce");
		setTimeout(function() {
			elem.removeClass("bounce");
		}, 550);
	}
}]);
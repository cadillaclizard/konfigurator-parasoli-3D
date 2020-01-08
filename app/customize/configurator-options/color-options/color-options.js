app.directive("colorOptions", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "customize/configurator-options/color-options/color-options.html",
		controllerAs: "vm",
		controller: "colorOptionsController"
	};
});

app.controller("colorOptionsController", ["$rootScope", "$scope", "appService", function ($rootScope, $scope, appService) {
	var vm = this;
	vm.customCMYK = { C: 0, M: 0, Y: 0, K: 0 };

	vm.resetCmyk = function() { vm.customCMYK = { C: 0, M: 0, Y: 0, K: 0 } }

	// TODO: może by tak to pobierać z WP?
	vm.defaultColors = [
		{ color: "FFFFFF", paleteNo: "9001" },
		{ color: "FFFFCC", paleteNo: "9002" },
		{ color: "FBBE02", paleteNo: "9005" },
		{ color: "065019", paleteNo: "9006" },
		{ color: "18183A", paleteNo: "9007" },
		{ color: "D00204", paleteNo: "9008" },
		{ color: "672831", paleteNo: "9009" },
		{ color: "183022", paleteNo: "9010" },
		{ color: "F1E5B1", paleteNo: "9011" },
		{ color: "BA996C", paleteNo: "9012" },
		{ color: "8F948E", paleteNo: "9013" },
		{ color: "5E5751", paleteNo: "9014" },
		{ color: "59543E", paleteNo: "9015" }
	];
	vm.selectColor = function(color) {
		vm.selectedColor = color;
		if (!!color.paleteNo) {
			vm.resetCmyk()
		} else {
			appService.showWarning().onNext();
		}
		
		$rootScope.$broadcast("model-color-changed", color);
	}

	vm.onCmykSlide = function() {
		vm.customCMYK.C = Math.min(vm.customCMYK.C, 100) || 0;
		vm.customCMYK.M = Math.min(vm.customCMYK.M, 100) || 0;
		vm.customCMYK.Y = Math.min(vm.customCMYK.Y, 100) || 0;
		vm.customCMYK.K = Math.min(vm.customCMYK.K, 100) || 0;

		c = vm.customCMYK.C / 100;
		m = vm.customCMYK.M / 100;
		y = vm.customCMYK.Y / 100;
		k = vm.customCMYK.K / 100;

		var r = 1 - Math.min( 1, c * ( 1 - k ) + k );
		var g = 1 - Math.min( 1, m * ( 1 - k ) + k );
		var b = 1 - Math.min( 1, y * ( 1 - k ) + k );

		r = Math.round( r * 255 );
		g = Math.round( g * 255 );
		b = Math.round( b * 255 );

		var hexColor = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		vm.selectColor({ color: hexColor, paleteNo: null, cmyk: vm.customCMYK });
	}

	
	vm.resetCmyk();
}]);
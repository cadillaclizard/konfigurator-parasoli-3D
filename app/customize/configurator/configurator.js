app.directive("configurator", function() {
	return {
		restrict: "E",
		scope: { preview: "=" },
		templateUrl: "customize/configurator/configurator.html",
		controllerAs: "vm",
		controller: "configuratorController"
	};
})

app.controller("configuratorController", ["$scope", "$element", "appService", "$q", "$rootScope", function($scope, $element, appService, $q, $rootScope) {
	var vm = this;
	var model = this.model = !!$scope.preview ? $scope.preview.model : appService.getModel();
	vm.images = [];
	if (!model) return;

	vm.engine = engine = new ConfiguratorEngine(model, $q, $element, $scope);
	engine.init().then(function() {
		$element.addClass("ready");
		$scope.$evalAsync(function() { vm.isInitialized = true; })
		hookEvents();

		var images = !!$scope.preview ? $scope.preview.images : appService.getImages();

		for (var key in images) {
			engine.addImage(images[key]);
		}
		
		if (!!model.color) {
			engine.changeColor(model.color.color);
		}
	});

	function hookEvents() {
		$element.on("mousewheel DOMMouseScroll", function(event) {
			console.log(event);
			var wheelDelta = !!event.originalEvent.detail ? -event.originalEvent.detail : event.originalEvent.wheelDelta;
			var delta = wheelDelta >= 0 ? 10 : -10;
			$scope.$evalAsync(function() { engine.zoomCamera(delta); });
		});

		window.addEventListener("keydown", function(event) {
			if (event.keyCode == 32 && !$("input").is(":focus")) {
				$scope.$evalAsync(function() { engine.toggleCamera(); });
			}
		});
	}

	$scope.$on("model-color-changed", function(event, color) { 
		model.color = color;
		engine.changeColor(color.color);
	});
	$scope.$on("decal-image-added", function(event, image) {
		engine.addImage(image);
		vm.images.push(image);
	});
	$scope.$on("decal-image-changed", function(event, image) { engine.updateImage(image); });
	$scope.$on("decal-image-removed", function(event, image) {
		engine.removeImage(image);
		_.remove(vm.images, image);
	});
	$scope.$on("decal-image-selected", function(event, image) { 
		$scope.$evalAsync(function() { 
			engine.toggleCamera(false);
			vm.selectedImage = image;

			if (!!image) {
				imagePropeller.angle = image.decal.rotation;
			}
		});
		engine.selectImage(image);
	});

	imagePropeller = new Propeller($(".rotate-with-mouse"), { interia: 0, speed: 0, step: 1,
		onRotate: function() {
			vm.selectedImage.decal.rotation = this.angle;
			engine.updateImage(vm.selectedImage);
		}
	});

	vm.changeImageScale = function(delta) {
		vm.selectedImage.decal.scale += 2 * delta;
		if (vm.selectedImage.decal.scale < 2)
			vm.selectedImage.decal.scale = 2;

		engine.updateImage(vm.selectedImage);
	}

	// For PDF
	$scope.$on("get-screenshot", function(event, color) {
		$rootScope.$broadcast("get-screenshot-result", engine.getScreenshot(-90, 90));
		$rootScope.$broadcast("get-screenshot-result", engine.getScreenshot(-90, 180));
		$rootScope.$broadcast("get-screenshot-result", engine.getScreenshot(-90, 270));
		$rootScope.$broadcast("get-screenshot-result", engine.getScreenshot(-90, 360));
	});


	// TODO: dispose
	/*$scope.$on("$destroy", function() {
		vm.cancelRendering = true;

		_.forEach(vm.scene.children, function(children) { vm.scene.remove(children); });
		vm.renderer.dispose();
		vm.controls.dispose();

		_.forEach(vm.$disposables, function(disposable) { disposable.dispose(); });
	});*/
}]);
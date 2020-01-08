app.directive("imagesOptions", function () {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "customize/configurator-options/images-options/images-options.html",
		controllerAs: "vm",
		controller: "imagesOptionsController",
		link: function(scope, element, attrs, ctrl) {
			ctrl.handleFileInput();
		}
	}
});

app.controller("imagesOptionsController", ["$rootScope", "$scope", "$element", "appService", function($rootScope, $scope, $element, appService) {
	var vm = this;
	vm.images = appService.getImages();
	vm.selectedImage = null;

	vm.selectImage = function(image) {
		vm.selectedImage = image;
		$rootScope.$broadcast("decal-image-selected", image);
	}

	vm.removeImage = function(image) {
		delete vm.images[image.id];
		if (vm.selectedImage === image) {
			var img = vm.images[Object.keys(vm.images)[Object.keys(vm.images).length - 1]]; // get last image
			vm.selectImage(img);
		}
		$rootScope.$broadcast("decal-image-removed", image);
	}

	vm.changeSelectedImageRepetition = function(repetition) {
		vm.selectedImage.repetition = repetition;
		$rootScope.$broadcast("decal-image-changed", vm.selectedImage);
	}

	this.handleFileInput = function() {
		$element.find("#file-select").bind("change", function(changeEvent) {
			appService.showWarning().onNext();
			var files = $.extend({}, changeEvent.target.files);
			changeEvent.target.value = "";

			_.forEach(files, function(file) {
				var reader = new FileReader();
				reader.onload = FileReaderOnLoad;
				reader.readAsDataURL(file);
			})

			function FileReaderOnLoad(readerEvent) {
				var base64Image = readerEvent.target.result;
				var img = new Image();

				img.onload = function() {
					var model = {
						id: "image #" + _.uniqueId(),
						url: base64Image,
						repetition: "once",
						aspectRatio: img.width / img.height
					}

					$scope.$evalAsync(function() { vm.images[model.id] = model; });
					$rootScope.$broadcast("decal-image-added", model);
					vm.selectImage(model);
				}

				img.src = base64Image;
			};
		});
	}
}]);
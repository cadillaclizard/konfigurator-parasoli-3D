app.directive("textOptions", function () {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "customize/configurator-options/text-options/text-options.html",
		controllerAs: "vm",
		controller: "textOptionsController"
	}
});

app.controller("textOptionsController", ["$rootScope", "$scope", "$element", function($rootScope, $scope, $element) {
	var vm = this;
	var domTextHolder = $element.find("#dom-text-holder");

	vm.inputModel = "";
	vm.isModelEmpty = true;
	vm.texts = {};
	vm.selectedText = null;

	vm.textColorsStack = ["#000000","#FFFFFF","#7F7F7F","#C3C3C3","#880015","#B97A57","#ED1C24","#FFAEC9","#FF7F27","#FFC90E","#FFF200","#EFE4B0","#22B14C","#B5E61D","#00A2E8","#99D9EA","#3F48CC","#7092BE","#A349A4","#C8BFE7"];
	vm.textColor = "#000000";
	vm.fontFamily = "Arial";

	vm.removeText = function(text) {
		delete vm.texts[text.id];
		if (vm.selectedText === text) {
			vm.selectedText = vm.texts[Object.keys(vm.texts)[Object.keys(vm.texts).length - 1]]; // get last text
		}

		vm.isModelEmpty = Object.keys(vm.texts).length === 0;
		$rootScope.$broadcast("decal-image-removed", text);
	}

	vm.selectText = function(text) {
		vm.selectedText = text;
		$rootScope.$broadcast("decal-image-selected", text);
	}

	vm.changeSelectedTextRepetition = function(repetition) {
		vm.selectedText.repetition = repetition;
		$rootScope.$broadcast("decal-image-changed", vm.selectedText);
	}

	vm.addText = function(event) {
		if (!!event && event.keyCode != 13)
			return;

		var ctx = document.getElementById("text-canvas").getContext("2d");
		ctx.font = "100px " + vm.fontFamily;
		ctx.canvas.width = ctx.measureText(vm.inputModel).width;
		ctx.canvas.height = 120;
		ctx.translate(0.5, 0.5);
		ctx.imageSmoothingEnabled = true;
		ctx.font = "100px " + vm.fontFamily;
		ctx.fillStyle = vm.textColor;
		ctx.fillText(vm.inputModel, 0, 95);
		var dataUrl = ctx.canvas.toDataURL();

		var img = new Image();

		img.onload = function() {
			var model = {
				id: "text #" + _.uniqueId(),
				url: dataUrl,
				repetition: "once",
				aspectRatio: img.width / img.height,
				textData: {
					fontFamily: vm.fontFamily,
					fontSize: vm.fontSize,
					color: vm.textColor,
					text: vm.inputModel
				}
			}

			$scope.$evalAsync(function() {
				vm.texts[model.id] = model;
				vm.isModelEmpty = false;
				vm.inputModel = "" 
			});
			$rootScope.$broadcast("decal-image-added", model);
			vm.selectText(model);
		};

		img.src = dataUrl;

		return;
	}
}]);
app.directive("saveOptions", function () {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "customize/configurator-options/save-options/save-options.html",
		controller: ["$scope", "customizeService", function($scope, customizeService) {
			$scope.downloadConfig = function() {
				var canvas = $("configurator canvas").get(0);
				var imgData = canvas.toDataURL("image/jpeg", 1.0);
				var pdf = new jsPDF();
				pdf.setFontSize(40);
				pdf.text(35, 25, "Perfekta - konfigurator");
				pdf.addImage(imgData, 'JPEG', 15, 40, 180, 180);
				pdf.save("parasol.pdf");
			}
		}]
	}
});
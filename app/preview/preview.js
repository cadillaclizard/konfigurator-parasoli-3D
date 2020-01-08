app.directive("preview", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "preview/preview.html",
		controllerAs: "vm",
		controller: "previewController"
	}
});

app.controller("previewController", ["$scope", "$state", "$stateParams", "$http", function($scope, $state, $stateParams, $http) {
	if (!$stateParams.id) {
		$state.go("select-model");
	}

	var vm = this;
	vm.id = $stateParams.id;
	var url = "http://dev.lithium.pl/perfecta/wp/wp-content/uploads/orders/" + vm.id + "/order.json";

	$http.get(url).then(
		function(response){
			$scope.$evalAsync(function() { vm.model = response.data; })
		},
		function(err){
			$scope.$evalAsync(function() { vm.notFound = true; })
		}
	);

	vm.downloadPdf = function() {
		var data = vm.model;
		var id = vm.id;
		var prices = vm.model.prices;

		var logoPerfectaBase64 = "data:image/jpeg;base64,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";

		var columns = [{
			width: 'auto',
			margin: [0, 0, 10, 0],
			stack: []
		},
		{
			width: 'auto',
			stack: []
		}];
		var cmyk = data.model.color.cmyk;
		var docDefinition = {
			info: {
				title: "Zamówienie " + id,
				author: "Perfecta - konfigurator"
			},
			pageMargins: [ 10, 10, 10, 10 ],
			content: [
				{ image: logoPerfectaBase64, fit: [100, 100], style: { alignment: "center" }},
				"\nKod Zamówienia: " + id,
				"\nZamawiajacy:",
				"Dane: " + data.orderForm.person.name,
				"Kontakt: " + data.orderForm.person.mail + ", " + data.orderForm.person.phone,
				data.orderOptions.delivery == "personal" ? "" : ("Adres: " + data.orderForm.person.street + ", " + data.orderForm.person.postalCode + " " + data.orderForm.person.city),
				!data.orderForm.invoiceNeeded ? "": "\nDane do faktury: \n Firma: " + data.orderForm.company.name + "\nNIP: " + data.orderForm.company.nip + "\nAdres: " + data.orderForm.company.street + ", " + data.orderForm.company.postalCode + " " + data.orderForm.company.city + ", " + data.orderForm.company.country,

				"\nParasol: " + data.model.title + " " + data.model.subtitle,
				"Kolor materiału: " + (!!data.model.color.paleteNo ? "nr. z palety " + data.model.color.paleteNo : "C: " + cmyk.C + ", M: " + cmyk.M + ", Y: " + cmyk.Y + ", K: " + cmyk.K),
				"Ilość: " + data.orderOptions.count,
				"Podstawa parasola: " + (!!data.orderOptions.base ? data.orderOptions.base.name : "bez podstaw parasola"),
				(!!data.orderOptions.base ? "Ilość podstaw: " + data.orderOptions.baseCount : ""),
				"Dostawa: " + (data.orderOptions.delivery == "personal" ? "Odbiór osobisty" : "Przesyłka kurierska"),

				"\nCena: " + prices.netto + " NETTO " + "(" + prices.brutto + " BRUTTO)",
				"Dostawa: " + prices.delivery,

				"\nDane do przelewu:",
				"Perfecta Aleksander Szczebak,\nul. Mickiewicza 65, 51-684 Wroclaw",
				"Bank Zachodni WBK S.A.\n50 1090 2415 0000 0006 1200 7585\n\n",
				{ columns: columns },
				{
					text: "\n*Przedstawiona wizualizacja ma charakter pogladowy i nie moze byc traktowane jako ostateczny projekt realizacyjny, ze wzgledu na rozne kalibracje, kolory rzeczywiste oraz grafika moga sie roznic od tych widzianych na monitorze.",
					style: { fontSize: 9, aligment: "bottom" }
				}
			]
		};

		var screenshotCount = 0;
		$scope.$on("get-screenshot-result", function(event, imageUrl) {
			screenshotCount++;
			columns[screenshotCount % 2].stack.push(
				{ image: imageUrl, fit: [280, 280], margin: [0, 0, 0, 10] }
			);

			if (screenshotCount == 4 ) {
				docDefinition.content.push();
				pdfMake.createPdf(docDefinition).open();
			}
		});
		$scope.$broadcast("get-screenshot");
	}
}]);
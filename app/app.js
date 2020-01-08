var app = angular.module("app", ["ui.router", "ui.bootstrap-slider", "ngAnimate"]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise("/");

	$stateProvider
		.state("select-model", {
			url: "/",
			template: "<select-model></select-model>"
		})
		.state("customize", {
			url: "/personalizacja",
			template: "<customize></customize>",
			params: { model: null }
		})
		.state("order-options", {
			url: "/opcje",
			template: "<order-options></order-options>"
		})
		.state("order-form", {
			url: "/zamowienie",
			template: "<order-form></order-form>"
		})
		.state("summary", {
			url: "/podsumowanie",
			template: "<summary></summary>"
		})
		.state("confirmation", {
			url: "/potwierdzenie",
			template: "<confirmation></confirmation>",
			params: {
				submitModel: null,
				previewId: null,
				prices: {}
			}
		})
		.state("preview", {
			url: "/preview/{id}",
			template: "<preview></preview>"
		})
});

app.directive("app", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "app.html",
		controllerAs: "vm",
		controller: "appController"
	}
});

app.controller("appController", ["$state", function($state) {
	this.$state = $state;
}]);

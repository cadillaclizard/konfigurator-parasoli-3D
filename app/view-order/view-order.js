app.directive("viewOrder", function() {
	return {
		restrict: "E",
		scope: {},
		templateUrl: "view-order/view-order.html",
		controllerAs: "vm",
		controller: "viewOrderController"
	}
});

app.controller("viewOrderController", ["$scope", "$http", function($scope, $http) {
	var vm = this;
	$scope.vm.orderGuid = "579a01d9f37f8";
	$scope.vm.orderJso = "";
	
	var url = "http://dev.lithium.pl/perfecta/wp/wp-content/uploads/orders/" + $scope.vm.orderGuid + "/order.json";

	$http.get(url).then(function(response){
		$scope.vm.orderJson = response.data;
		console.log(response.data);
	}, function(err){
		alert("error");
		console.log(err);
	});
	

	var discountId = "XXX-ZZ";
	$scope.vm.discount = -1;

	var req = {
		method: 'POST',
		url: 'http://dev.lithium.pl/perfecta/wp/wp-admin/admin-ajax.php',
		data: $.param({
			action: "getDiscount",
			discount: discountId
		}),
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	}

	$http(req).then(function(response){
		$scope.vm.discount = response.data;
		console.log(response);
	}, function(err){
		alert("error");
		console.log(err);
	});

}]);
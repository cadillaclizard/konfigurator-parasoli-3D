app.directive("ngClickAnimate", ['$animate', function($animate) {
	return {
		link: function (scope, element, attrs) {
			element.on('click', function() {
				var self = angular.element(this);
				if (self.hasClass("disable-ng-click"))
					return;

				$animate.addClass(self, "ng-click").then(function() {
					self.removeClass("ng-click");
				});
			});
		}
	};
}]);
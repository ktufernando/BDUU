'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.user = Authentication.getUser();
		$scope.isCollapsed = false;
		$scope.menus = [];
		$scope.menus.push(Menus.getMenu('public'));
		$scope.menus.push(Menus.getMenu('private'));
        $scope.menus.push(Menus.getMenu('admin'));

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.$on('userLoaded', function() {
			$scope.user = Authentication.getUser();
		});

		$scope.signout = function(){
			Authentication.deleteData();
		};
	}
]);

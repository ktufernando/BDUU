'use strict';

angular.module('users').controller('AuthenticationLoguedController', ['$scope', '$http', '$location', '$base64', 'Authentication',
	function($scope, $http, $location, $base64, Authentication) {
        $scope.user = Authentication.getUser();

        $scope.credentials = {
            username : $scope.user.username
        };

		$scope.signup = function() {
			$http.put('/users', $scope.user).success(function(response) {
				// If successful we assign the response to the global user model
				Authentication.setData(response);
                $scope.$close();
				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.defaults.headers.common.Authentication =
				'Basic ' + $base64.encode($scope.credentials.username + ':' + $scope.credentials.password);
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				Authentication.setData(response);
                $scope.$close();
				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', '$base64', '$window', 'Authentication',
	function($scope, $http, $location, $base64, $window, Authentication) {

		// If user is signed in then redirect back home
		if (Authentication.getUser()) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				Authentication.setData(response);
				// And redirect to the index page
				$location.path('/email/verification');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.defaults.headers.common.Authorization =
				'Basic ' + $base64.encode($scope.credentials.username + ':' + $scope.credentials.password);

			$http.post('/auth/signin').success(function(response) {
				// If successful we assign the response to the global user model
				Authentication.setData(response);
				// And redirect to the index page
				$location.path('/');
			}).error(function(response, status) {
				if(status === 401){
					$scope.error = "Invalid Credentials";
					return;
				}
				$scope.error = response.message;
			});
		};
	}
]);

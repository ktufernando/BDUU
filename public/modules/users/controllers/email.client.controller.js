'use strict';

angular.module('users').controller('EmailController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
        $scope.user = Authentication.getUser();

        $scope.sendEmailVerification = function () {
            $http.post('/users/verification/email', {email: $scope.user.email}).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
        };

        $scope.verifyEmail = function () {
            $http.get('/users/verify/email/' + $stateParams.token).success(function (response) {
                // Show user success message and clear form
                $scope.success = 'Email for your account has been verified';

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
        };

    }
]);

'use strict';

angular.module('dynamic').controller('DynamicController', ['$scope', '$stateParams', '$location', 'Authentication', 'DynamicService',
	function($scope, $stateParams, $location, Authentication, DynamicService) {
		$scope.authentication = Authentication;

        $scope.create = {
            appName : '',
            pairs : []
        };

        $scope.addPair = function(){
            $scope.create.pairs.push({
                key : '',
                value : ''
            });
        };

        $scope.putDynamicData = function(){
            var data = {};
            for(var i in $scope.create.pairs){
                data[$scope.create.pairs[i].key] = $scope.create.pairs[i].value;
            }
            var service = new DynamicService(data);
            service.$update({app : $scope.create.appName},function(response) {
                $scope.create = {
                    appName : '',
                    pairs : []
                };
                $scope.success = true;
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

        };

        $scope.findUserDynamicData = function() {
            var service = new DynamicService();

            service.$get({app:$scope.appName},function(response) {
				$scope.userDynamicData = JSON.stringify(response);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);
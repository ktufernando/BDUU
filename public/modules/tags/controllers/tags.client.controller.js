'use strict';

angular.module('tags').controller('TagsController', ['$scope', '$stateParams', '$location', 'Authentication', 'TagsService',
	function($scope, $stateParams, $location, Authentication, TagsService) {
		$scope.authentication = Authentication;

		$scope.setTag = function() {
			var tag = {
				tag: this.tag.name,
				keys: this.tag.keys.split(',')
			};

            TagsService.tag.save(tag, function(response) {
                $location.path('usertags');
				$scope.tag = {};
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

        $scope.setSubtag = function() {
            $scope.subtag.keys = $scope.subtag.keys.split(',');
            TagsService.subtag.update($scope.subtag, function(response) {
                $location.path('usertags');

				$scope.subtag = {};
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

        $scope.findTags = function() {
            TagsService.tags.get(function(response) {
				$scope.allTags = JSON.stringify(response.tags);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);
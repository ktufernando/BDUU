'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('dynamic').factory('DynamicService', ['$resource',
	function($resource) {
		return $resource('/dynamic/:app', {}, { 'update': { method:'PUT' }});
	}
]);
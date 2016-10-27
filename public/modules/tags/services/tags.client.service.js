'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('tags').factory('TagsService', ['$resource',
	function($resource) {
		return {
            tags : $resource('/tags'),
            tag : $resource('/tag'),
            subtag : $resource('/subtag', null, { 'update': { method:'PUT' }})
        };
	}
]);
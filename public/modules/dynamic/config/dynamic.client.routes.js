'use strict';

// Setting up route
angular.module('dynamic').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('dynamic-put', {
			url: '/dynamic/put',
			templateUrl: 'modules/dynamic/views/put.client.view.html'
		}).
		state('dynamic-get', {
			url: '/dynamic/get',
			templateUrl: 'modules/dynamic/views/get.client.view.html'
		});
	}
]);
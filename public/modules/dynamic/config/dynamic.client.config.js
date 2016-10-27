'use strict';

// Configuring the Articles module
angular.module('dynamic').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('private', 'Dynamic Data', 'dynamic', 'dropdown');
		Menus.addSubMenuItem('private', 'dynamic', 'PUT', 'dynamic/put', '/dynamic/put');
		Menus.addSubMenuItem('private', 'dynamic', 'GET', 'dynamic/get', '/dynamic/get');
	}
]);
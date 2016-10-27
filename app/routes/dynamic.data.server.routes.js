'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	dynamic = require('../../app/controllers/dynamic.data');

module.exports = function(app) {

	var jwtauth = require('../../config/jwtAuth');

	// DynamicUserData Routes
	app.route('/dynamic/:app')
		.get(jwtauth, users.requiresAuth, dynamic.byUser, dynamic.get)
        .put(jwtauth, users.requiresAuth, dynamic.byUser, dynamic.put);

};

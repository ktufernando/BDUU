'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	config = require('../../app/controllers/configurations');

module.exports = function(app) {

	var jwtauth = require('../../config/jwtAuth');

	// UserConfigurations Routes
	app.route('/configurations')
		.get(jwtauth, users.requiresAuth, config.getConfByUser, config.get);

	app.route('/configurations/global')
		.get(jwtauth, users.requiresAuth, config.getConfByUser, config.getGlobalConf)
        .put(jwtauth, users.requiresAuth, config.getConfByUser, config.putGlobalConf);

	app.route('/configurations/:app')
		.get(jwtauth, users.requiresAuth, config.getConfByUser, config.getAppConf)
        .put(jwtauth, users.requiresAuth, config.getConfByUser, config.putAppConf);

};

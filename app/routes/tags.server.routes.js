'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	tags = require('../../app/controllers/tags');

module.exports = function(app) {

	var jwtauth = require('../../config/jwtAuth');

	// UserTags Routes
	app.route('/tags').get(jwtauth, users.requiresAuth, tags.get);
    app.route('/tag').post(jwtauth, users.requiresAuth, tags.createTag);
	app.route('/subtag').put(jwtauth, users.requiresAuth, tags.createSubtag);

};

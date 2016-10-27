'use strict';

/**
 * Module dependencies.
 */
var
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.profile = user;
		next();
	});
};

/**
 * A simple middleware to restrict access to authenticated users.
 */
exports.requiresAuth = function(req, res, next) {
	if (!req.user) {
		return res.status(401).send({
			message: 'Not authenticated'
		});
	}
	next();
};


/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(req, res, next) {
		_this.requiresAuth(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).send({
					message: 'User is not authorized'
				});
			}
		});
	};
};


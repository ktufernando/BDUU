'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');


module.exports = function(app) {

	var jwtauth = require('../../config/jwtAuth');

	// User Routes
	var users = require('../../app/controllers/users');

    // Temporary user for UUID
    app.route('/auth/guest').post(users.guest);

	// Setting up the users profile api
	app.route('/users/me').get(jwtauth, users.me);
	app.route('/users').put(jwtauth, users.update);

	// Setting up the users password api
	app.route('/users/password').post(jwtauth, users.changePassword);

	app.route('/auth/forgot').post(users.forgot);
	//app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(passport.authenticate('basic', {session: false}), users.token);
    //app.route('/auth/signout').get(users.signout);

    // Setting up the users verification mail
    app.route('/users/verification/email').post(users.sendVerificationEmail);
    app.route('/users/verify/email/:token').get(users.verifyEmail);

	app.route('/auth/social').post(users.socialNormalize, users.oauthSocialUserProfile);
	app.route('/auth/social').put(jwtauth, users.socialNormalize, users.addSocialProvider);


	// Setting the facebook oauth routes
	/*app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));*/

	// Setting the twitter oauth routes
	/*app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));*/

	// Setting the google oauth routes
	/*app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));*/

	// Setting the linkedin oauth routes
	/*app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));*/

	//app.route('/users/accounts').delete(users.removeOAuthProvider);
	
	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};

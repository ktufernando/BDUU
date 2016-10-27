'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
    users = require('../users'),
	nodemailer = require('nodemailer'),
	async = require('async'),
	crypto = require('crypto');

/**
 * Send Email for verification email (POST)
 */
exports.sendVerificationEmail = function(req, res, next) {
	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		// Lookup user by username
		function(token, done) {
            User.findOne({
                email: req.body.email
            }, '-salt -password', function(err, user) {
                if (!user) {
                    return res.status(400).send({
                        message: 'No account with that email has been found'
                    });
                } else if (user.provider !== 'local') {
                    return res.status(400).send({
                        message: 'It seems like you signed up using your ' + user.provider + ' account'
                    });
                } else {
                    user.verificationToken = token;
                    user.save(function(err) {
                        done(err, token, user);
                    });
                }
            });
		},
		function(token, user, done) {
		    res.render('templates/verification-email', {
				name: user.displayName,
                email: user.email,
				appName: config.app.title,
                url: req.body.callback ? req.body.callback + token : 'http://' + req.headers.host + '/#!/email/verify/' + token
			}, function(err, emailHTML) {
                done(err, emailHTML, user);
			});

		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
            var smtpTransport = nodemailer.createTransport(config.mailer.options);
            var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Please verify your email for ' + config.app.title,
				html: emailHTML
			};
			smtpTransport.sendMail(mailOptions, function(err) {
                if (!err) {
                    res.send({
						message: 'An email has been sent to ' + user.email + ' for verification.'
					});
				}
				done(err);
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Verify Email GET from email token
 */
exports.verifyEmail = function(req, res, next) {
    async.waterfall([

        function(done) {
            User.findOne({
                verificationToken: req.params.token
            }, function(err, user) {
                if (!err && user) {
                    user.verificationToken = undefined;
                    user.verified = true;
                    user.save(function(err) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.jsonp(user);
                            done(err, user);
                        }
                    });
                } else {
                    return res.status(400).send({
                        message: 'Verification token is invalid.'
                    });
                }
            });
        },
        /*function(user, done) {
            var searchQueryEmail = { $or: [
                    {'email': user.email},
                    {'providersData.facebook.email': user.email},
                    {'providersData.google.email': user.email},
                    {'providersData.linkedin.email': user.email}
                ],
                _id : {'$ne':user.id}
            };
            User.findOne(searchQueryEmail, function (err, userWithSameEmail) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    if (userWithSameEmail) {
                        var callbackMerge = function (err, u){
                            if(err){
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }else{
                                res.jsonp(u);
                                done(err, u);
                            }
                        };
                        if (userWithSameEmail.provider === 'local' && user.provider !== 'local') {
                            users.mergeUser(userWithSameEmail, user, callbackMerge);
                        } else {
                            users.mergeUser(user, userWithSameEmail, callbackMerge);
                        }
                    }else{
                        res.jsonp(user);
                        done(err, user);
                    }
                }
            });
        },*/
        function(user, done) {
            res.render('templates/email-verified-confirm-email', {
                name: user.displayName,
                appName: config.app.title
            }, function(err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, user, done) {
            var smtpTransport = nodemailer.createTransport(config.mailer.options);
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Your email has been verified',
                html: emailHTML
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
    });
};

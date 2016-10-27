'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
    async = require('async'),
	passport = require('passport'),
	User = mongoose.model('User'),
    configCont = require('../configurations'),
    //tagsCont = require('../tags'),
    dynamicCont = require('../dynamic.data'),
    config = require('../../../config/config');


var mergeUser = function(user, userToDel, done){
    configCont.mergeUserConfigurations(user, userToDel);
    dynamicCont.mergeDynamicUsersData(user, userToDel);
    //tagsCont.mergeUsersTags(user, userToDel);
    user.providersData =  _.merge(userToDel.providersData, user.providersData);
    user.personalInfo =  _.merge(userToDel.personalInfo, user.personalInfo);
    user.markModified('providersData');
    user.markModified('personalInfo');
    user.updated = new Date();
    userToDel.remove();
    user.save(function (err, u) {
        if (err) {
            done(err, u);
        } else {
            done(null, u);
        }
    });
};

exports.mergeUser = function(user, userToDel, callback){
    mergeUser(user, userToDel, callback);
};


var tokenResult = function(req){
    var result = req.user.createJWTToken(config.tokenSecret);
    result.user = req.user;
    return result;
};


exports.token = function(req, res) {
    return res.json(tokenResult(req));
};

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	// Then save the user 
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
        } else {
            // Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

            req.user = user;

            return res.json(tokenResult(req));
		}
	});
};

/**
 * Signout
 */
/*exports.signout = function(req, res) {
	req.user = null;
	res.redirect('/');
};*/

/**
 * OAuth callback
 */
/*exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};*/


exports.socialNormalize = function(req, res, next) {
    if(!req.body.provider || !req.body.profile){
        return res.status(400).send({
            message: 'El provider y el profile son requeridos'
        });
    }

    var providerData = req.body.profile;
    providerData.accessToken = req.body.accessToken;
    providerData.refreshToken = req.body.refreshToken;
    var firstName = providerData.name ? providerData.name.givenName : '';
    var lastName = providerData.name ? providerData.name.familyName: '';
    var providerUserProfile = {
        firstName: firstName,
        lastName: lastName,
        displayName: firstName + ' ' + lastName,
        email: providerData.email,
        username: providerData.username,
        provider: req.body.provider,
        providerIdentifierField: 'id',
        providerData: providerData
    };
    req.providerUserProfile = providerUserProfile;
    return next();
};

var mergeProviderData = function(user, providerUserProfile){
    // Add the provider data to the additional provider data field
    if (!user.providersData) user.providersData = {};
    user.providersData[providerUserProfile.provider] = providerUserProfile.providerData;
    user.markModified('providersData');
    return user;
};

exports.oauthSocialUserProfile = function(req, res) {

    var finalUser = null,
        providerUserProfile = req.providerUserProfile;

    var createUserWithProviderData = function(user, providerUserProfile){
        var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

        User.findUniqueUsername(possibleUsername, null, function(availableUsername) {

            var providerData = {};
            providerData[providerUserProfile.provider] = providerUserProfile.providerData;

            user = new User({
                firstName: providerUserProfile.firstName,
                lastName: providerUserProfile.lastName,
                username: availableUsername,
                displayName: providerUserProfile.displayName,
                email: providerUserProfile.email,
                provider: providerUserProfile.provider,
                providersData: providerData
            });

            // And save the user
            saveUser(user);
        });
    };

    var providersSearch = function(callback){
        // Define a search query fields
        var searchProvidersIdentifierField = 'providersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;
        // Define providers search query
        var providersSearchQuery = {};
        providersSearchQuery[searchProvidersIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
        // Check if exist user with the provider data
        User.findOne(providersSearchQuery, function(err, user) {
            callback(err, user);
        });
    };

    var saveUser = function(user){
        if(user){
            user.markModified('providersData');
            user.save(function (err, u) {
                if (err) {
                    return res.status(400).send(err);
                } else {
                    req.user = u;
                    return res.json(tokenResult(req));
                }
            });
        }

    };


    if(providerUserProfile.email) {

        var searchQueryEmail = { $or: [
            {'email': providerUserProfile.email},
            {'providersData.facebook.email': providerUserProfile.email},
            {'providersData.google.email': providerUserProfile.email},
            {'providersData.linkedin.email': providerUserProfile.email}
        ]};

        User.findOne(searchQueryEmail, function (err, user) {
            if (err) {
                return res.status(400).send(err);
            } else {
                // Add provider data to user with the same email
                if (user) {
                    finalUser = mergeProviderData(user, providerUserProfile);
                    saveUser(finalUser);
                }else{
                    providersSearch(function(err, user){
                        if (err) {
                            return res.status(400).send(err);
                        } else {
                            if (!user) {
                                createUserWithProviderData(user, providerUserProfile);
                            } else {
                                finalUser = mergeProviderData(user, providerUserProfile);
                                saveUser(finalUser);
                            }
                        }
                    });
                }
            }
        });
    }else{
        providersSearch(function(err, user){
            if (err) {
                return res.status(400).send(err);
            } else {
                if (!user) {
                    createUserWithProviderData(user, providerUserProfile);
                } else {
                    finalUser = mergeProviderData(user, providerUserProfile);
                    saveUser(finalUser);
                }
            }
        });
    }

};

/**
 * Helper function to save or update a OAuth user profile
 */
/*exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {

    var mergeProviderData = function(user, providerUserProfile, done){
        // Add the provider data to the additional provider data field
        if (!user.providersData) user.providersData = {};
        user.providersData[providerUserProfile.provider] = providerUserProfile.providerData;
        // Then tell mongoose that we've updated the additionalProvidersData field
        user.markModified('providersData');
        // And save the user
        user.save(function (err) {
            return done(err, user);
        });
    };
    var createUserWithProviderData = function(user, providerUserProfile, done){
        var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

        User.findUniqueUsername(possibleUsername, null, function(availableUsername) {

            var providerData = {};
            providerData[providerUserProfile.provider] = providerUserProfile.providerData;

            user = new User({
                firstName: providerUserProfile.firstName,
                lastName: providerUserProfile.lastName,
                username: availableUsername,
                displayName: providerUserProfile.displayName,
                email: providerUserProfile.email,
                provider: providerUserProfile.provider,
                providersData: providerData
            });

            // And save the user
            user.save(function(err) {
                return done(err, user);
            });
        });
    };

    // Define a search query fields
    var searchProvidersIdentifierField = 'providersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;
    // Define providers search query
    var providersSearchQuery = {};
    providersSearchQuery[searchProvidersIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    //Define a search query by email
    var searchQueryEmail = { $or: [
        {'email': providerUserProfile.email},
        {'providersData.facebook.email': providerUserProfile.email},
        {'providersData.google.email': providerUserProfile.email},
        {'providersData.linkedin.email': providerUserProfile.email}
    ]};


    if (!req.user) {

        if(providerUserProfile.email) {
            // Check if exist user with the email
            User.findOne(searchQueryEmail, function (err, user) {
                if (err) {
                    return done(err);
                } else {
                    // Add provider data to user with the same email
                    if (user) {
                        return mergeProviderData(user, providerUserProfile, done);
                    }else{
                        // Check if exist user with the provider data
                        User.findOne(providersSearchQuery, function(err, user) {
                            if (err) {
                                return done(err);
                            } else {
                                if (!user) {
                                    return createUserWithProviderData(user, providerUserProfile, done);
                                } else {
                                    return mergeProviderData(user, providerUserProfile, done);
                                }
                            }
                        });
                    }
                }
            });
        }
    }else{

        // User is already logged in, join the provider data to the existing user
        var user = req.user;

        searchQueryEmail._id = {'$ne':user.id};
        User.findOne(searchQueryEmail, function (err, userWithSameEmail) {
            if (err) {
                return done(err);
            } else {
                if (userWithSameEmail) {
                    var callbackMerge = function (err, u){
                        if(err && !u){
                            return done(err, u);
                        }
                        mergeProviderData(u, providerUserProfile, function(err, u){
                            return done(err, u);

                        });
                    };
                    if (userWithSameEmail.provider === 'local' && user.provider !== 'local') {
                        mergeUser(userWithSameEmail, user, callbackMerge);
                    } else {
                        mergeUser(user, userWithSameEmail, callbackMerge);
                    }
                }else // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
                    if (user.provider !== providerUserProfile.provider && (!user.providersData || !user.providersData[providerUserProfile.provider])) {

                    User.findOne(providersSearchQuery, function(err, userWithProvider) {
                        if (err) {
                            return done(err);
                        } else {
                            if (userWithProvider) {
                                var callbackMerge = function (err, u){
                                    return done(err, u);
                                };
                                if (userWithProvider.provider === 'local' && user.provider !== 'local') {
                                    mergeUser(userWithProvider, user, callbackMerge);
                                } else {
                                    mergeUser(user, userWithProvider, callbackMerge);
                                }
                            } else {
                                return mergeProviderData(user, providerUserProfile, done);
                            }
                        }
                    });
                } else {
                    return done(new Error('User is already connected using this provider'), user);
                }
            }

        });
    }
};*/

exports.addSocialProvider = function(req, res) {

    var user = req.user,
        providerUserProfile = req.providerUserProfile;

    user = mergeProviderData(user, providerUserProfile);


    // Define a search query fields
    var searchProvidersIdentifierField = 'providersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;
    // Define providers search query
    var providersSearchQuery = {};
    providersSearchQuery[searchProvidersIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
    // Check if exist user with the provider data


    if(providerUserProfile.email) {

        console.log('uno');

        //Define a search query by email
        var searchQueryEmail = { $or: [
            {'email': providerUserProfile.email},
            {'providersData.facebook.email': providerUserProfile.email},
            {'providersData.google.email': providerUserProfile.email},
            {'providersData.linkedin.email': providerUserProfile.email}
        ]};
        searchQueryEmail._id = {'$ne':user.id};

        User.findOne(searchQueryEmail, function (err, userWithSameEmail) {
            if (err) {
                return res.status(400).send(err);
            } else {
                if (userWithSameEmail) {
                    console.log('dos');
                    var callbackMerge = function (err, u){
                        if(err && !u){
                            return res.status(400).send(err);
                        }
                        return res.json(u);
                    };
                    if (userWithSameEmail.provider === 'local' && user.provider !== 'local') {
                        console.log('cuatro');
                        mergeUser(userWithSameEmail, user, callbackMerge);
                    } else {
                        console.log('cinco');
                        mergeUser(user, userWithSameEmail, callbackMerge);
                    }
                }else {
                    console.log('seis');
                    User.findOne(providersSearchQuery, function(err, userWithProvider) {
                        if (err) {
                            return res.status(400).send(err);
                        } else {
                            if (userWithProvider) {
                                if (user.username === userWithProvider.username) {
                                    console.log('once');
                                    user.save(function (err, data) {
                                        if (err) {
                                            return res.status(400).send(err);
                                        } else {
                                            return res.json(data);
                                        }
                                    });
                                } else {
                                    console.log('siete');
                                    var callbackMerge = function (err, u) {
                                        if (err) {
                                            return res.status(400).send(err);
                                        } else {
                                            return res.jsonp(u);
                                        }
                                    };
                                    if (userWithProvider.provider === 'local' && user.provider !== 'local') {
                                        console.log('ocho');
                                        user.save(function (err, data) {
                                            if (err) {
                                                return res.status(400).send(err);
                                            } else {
                                                return res.json(data);
                                            }
                                        });
                                    } else if(userWithProvider.provider === 'local'){
                                        console.log('nueve');
                                        mergeUser(userWithProvider, user, callbackMerge);
                                    }else{
                                        console.log('diez');
                                        mergeUser(user, userWithProvider, callbackMerge);
                                    }
                                }
                            } else {
                                console.log('doce');
                                user.save(function (err, data) {
                                    if (err) {
                                        return res.status(400).send(err);
                                    } else {
                                        return res.json(data);
                                    }
                                });
                            }
                        }
                    });
                }
            }

        });

    }else{
        console.log('trece');
        User.findOne(providersSearchQuery, function(err, userWithProvider) {
            if (err) {
                return res.status(400).send(err);
            } else {
                if (userWithProvider) {
                    console.log('quice');
                    if (user.username === userWithProvider.username) {
                        console.log('dieciseis');
                        user.save(function (err, data) {
                            if (err) {
                                return res.status(400).send(err);
                            } else {
                                return res.json(data);
                            }
                        });
                    } else {
                        console.log('diecisiete');
                        var callbackMerge = function (err, u) {
                            if (err) {
                                return res.status(400).send(err);
                            } else {
                                return res.jsonp(u);
                            }
                        };
                        if (userWithProvider.provider === 'local' && user.provider !== 'local') {
                            console.log('dieciocho');
                            user.save(function (err, data) {
                                if (err) {
                                    return res.status(400).send(err);
                                } else {
                                    return res.json(data);
                                }
                            });
                        } else if (userWithProvider.provider === 'local') {
                            console.log('diecinueve');
                            mergeUser(userWithProvider, user, callbackMerge);
                        } else {
                            console.log('veinte');
                            mergeUser(user, userWithProvider, callbackMerge);
                        }
                    }
                } else {
                    console.log('catorce');
                    user.save(function (err, data) {
                        if (err) {
                            return res.status(400).send(err);
                        } else {
                            return res.json(data);
                        }
                    });
                }
            }
        });
    }
};

/**
 * Remove OAuth provider
 */
/*exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.providersData[provider]) {
			delete user.providersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('providersData');
		}

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
                res.jsonp(user);
			}
		});
	}
};*/

/**
 * Create a temporary user for UUID
 */
exports.guest = function(req, res) {

    var username = req.body.uuid;

    if(!username){
        return res.status(400).send({
            message: 'El uuid es requerido'
        });
    }

    var email = username + '@provincianet.com.ar';

    User.findOne({username:username}, function(err, user) {
        if (err) {
            res.status(400).send(err);
        }
        if(user) {
            if(user.provider !== 'guest') {
                return res.status(400).send({
                    message: 'El usuario no es guest'
                });
            }
            req.user = user;
            return res.json(tokenResult(req));
        }
        if(!user){
            user = new User();
            user.username = username;
            user.email = email;
            user.provider = 'guest';
            user.save(function(err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }else{
                    req.user = user;
                    return res.json(tokenResult(req));
                }
            });
        }
    });

};

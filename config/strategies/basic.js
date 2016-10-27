'use strict';

var config                  = require('../config'),
    passport                = require('passport'),
    BasicStrategy           = require('passport-http').BasicStrategy,
    User                    = require('mongoose').model('User');

module.exports = function() {
    passport.use('basic', new BasicStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            User.findOne({username: username}, function(err, user){
                if(err) {
                    return done(err);
                }
                if(!user) {
                    return done(null, false, 'Unknown user');
                }
                if(!user.authenticate(password)) {
                    return done(null, false, 'Invalid password');
                }
                return done(null, user);
            });
        }));
};

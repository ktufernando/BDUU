'use strict';

var jwt  = require('jwt-simple'),
    User = require('mongoose').model('User'),
    config = require('./config');

module.exports = function(req, res, next) {
    var token;
    if (req.headers && req.headers.authorization) {
        var parts = [];
        try{
            parts = req.headers.authorization.split(' ');
        }catch (e){
            return res.status(401).json({message: 'Format is Authorization: Token [token]'});
        }
        if (parts.length === 2) {
            var scheme = parts[0],
                credentials = parts[1];

            if (/^Token$/i.test(scheme)) {
                token = credentials;
            }else{
                return res.status(401).json({message: 'Format is Authorization: Token [token]'});
            }
        } else {
            return res.status(401).json({message: 'Format is Authorization: Token [token]'});
        }
    } else if (req.param('token')) {
        token = req.param('token');
        delete req.query.token;
    } else {
        return res.status(401).json({message: 'No Authorization token was found'});
    }

    var decoded = jwt.decode(token, config.tokenSecret);

    if (decoded.expires <= Date.now()) {
        return res.status(400).json({message: 'Access token has expired'});
    }

    User.findOne({'_id': decoded.iss}, function(err, user) {
        if(err) {
            return res.status(500).send({message:err});
        }
        if(!user) {
            return res.status(401).send({message: 'No user found for the token'});
        }
        req.user = user;
        return next();
    });

};

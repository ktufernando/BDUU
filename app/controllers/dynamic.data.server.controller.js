'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Dynamic = mongoose.model('Dynamic.User.Data'),
	_ = require('lodash');


/**
 * dynamic data of User
 */
exports.get = function(req, res) {
    var data = req.dynamicData;
    var appName = req.param('app');
    if(!appName){
        return res.status(400).send({
            message: 'Please provide an app name'
        });
    }
    if(!data || !data.applications[appName]){
        return res.status(400).send({
            message: 'Dynamic data not found'
        });
    }
    res.jsonp(data.applications[appName]);
};

/**
 * dynamic data of User
 */
exports.put = function(req, res) {
    var data = req.dynamicData;
    var appName = req.param('app');
    if(!data){
        data = new Dynamic();
        data.user = req.user;
    }
    if(!data.applications)data.applications = {};
    if(!data.applications[appName]){
        data.applications[appName]=req.body;
    }else{
        data.applications[appName] = _.extend(data.applications[appName], req.body);
    }
    data.updated = Date.now();
    data.markModified('applications');
    data.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data.applications[appName]);
        }
    });
};

/**
 * Dynamic Data middleware
 */
exports.byUser = function(req, res, next) {
    Dynamic.findOne({user:req.user}).exec(function(err, data) {
        if (err) return next(err);
        req.dynamicData = data;
        next();
    });
};

exports.mergeDynamicUsersData = function (user, userToDel){
    Dynamic.findOne({user:user}).exec(function(err, data) {
        if(!data){
            data = new Dynamic();
            data.user = user;
        }
        Dynamic.findOne({user:userToDel}).exec(function(err, dataToDel) {
            if(dataToDel){
                if(dataToDel.applications){
                    data.applications = _.merge(dataToDel.applications, data.applications);
                    data.markModified('applications');
                }
                dataToDel.remove();
                data.updated = Date.now();
                data.save();
            }
        });
    });
};
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	UserConfig = mongoose.model('User.Configurations'),
	_ = require('lodash');


/**
 * All Configurations Data of User
 */
exports.get = function(req, res) {
    var data = req.userConfig;
    if(!data){
        return res.status(400).send({
            message: 'User configuration data not found'
        });
    }
    res.jsonp(data);
};

/**
 * Global Configurations Data of User
 */
exports.getGlobalConf = function(req, res) {
    var data = req.userConfig;
    if(!data){
        return res.status(400).send({
            message: 'User configuration data not found'
        });
    }
    res.jsonp(data.global);
};

/**
 * App Configurations Data of User
 */
exports.getAppConf = function(req, res) {
    var data = req.userConfig;
    if(!data){
        return res.status(400).send({
            message: 'User configuration data not found'
        });
    }
    res.jsonp(data.applications[req.param('app')]);
};

/**
 * set Global Configurations Data of User
 */
exports.putGlobalConf = function(req, res) {
    var data = req.userConfig;
    if(!data){
        data = new UserConfig();
        data.user = req.user;
    }
    var body = req.body;
    if(!body){
        return res.status(400).send({
            message: 'you did not send body payload'
        });
    }
    if(!data.global){
        data.global = body;
    }else{
        data.global = _.extend(data.global, body);
    }
    data.markModified('global');
    data.updated = Date.now();
    data.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(data.global);
        }
    });
};

/**
 * set App Configurations Data of User
 */
exports.putAppConf = function(req, res) {
    var data = req.userConfig;
    if(!data){
        data = new UserConfig();
        data.user = req.user;
    }
    var appName = req.param('app');
    var body = req.body;
    if(!body){
        return res.status(400).send({
            message: 'you did not send body payload'
        });
    }
    if(!data.applications)data.applications={};
    if(!data.applications[appName]){
        data.applications[appName]=body;
    }else{
        data.applications[appName] = _.extend(data.applications[appName], body);
    }
    data.markModified('applications');
    data.updated = Date.now();
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
 * User Configurations Data middleware
 */
exports.getConfByUser = function(req, res, next) {
    UserConfig.findOne({user:req.user}).exec(function(err, data) {
        if (err) return next(err);
        req.userConfig = data;
        next();
    });
};

exports.mergeUserConfigurations = function(user, userToDel){
    UserConfig.findOne({user:user}).exec(function(err, data) {
        if(!data){
            data = new UserConfig();
            data.user = user;
        }
        UserConfig.findOne({user:userToDel}).exec(function(err, dataToDel) {
            if(dataToDel){
                if(dataToDel.applications) {
                    data.applications = _.merge(dataToDel.applications, data.applications);
                    data.markModified('applications');
                }
                if(dataToDel.global){
                    data.global = _.merge(dataToDel.global, data.global);
                    data.markModified('global');
                }
                dataToDel.remove();
                data.updated = Date.now();
                data.save();
            }
        });
    });
};
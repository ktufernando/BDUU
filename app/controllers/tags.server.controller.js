'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Tags = mongoose.model('User.Tags'),
	_ = require('lodash');

var cleanStr = function(str){
    str = str.trim();
    return str.toLowerCase();
};

var cleanArrayStr = function(array){
  for(var i in array){
      array[i] = cleanStr(array[i]);
  }
  return array;
};


var logicTag = function(doc, tagName, keys) {
    tagName = cleanStr(tagName);
    keys = keys && keys.length ? cleanArrayStr(keys) : [];

    if (doc.tags[tagName]) {
        doc.tags[tagName].count++;
        doc.tags[tagName].keys = _.union(doc.tags[tagName].keys, keys);
    } else {
        doc.tags[tagName] = {};
        doc.tags[tagName].keys = keys;
        doc.tags[tagName].count = 1;
    }
    return doc;
};

var logicSubtag = function(doc, tagName, subtagName, keys) {
    tagName = cleanStr(tagName);
    subtagName = cleanStr(subtagName);
    keys = keys && keys.length ? cleanArrayStr(keys) : [];

    if (doc.tags[tagName][subtagName]) {
        doc.tags[tagName][subtagName].count++;
        doc.tags[tagName][subtagName].keys = _.union(doc.tags[tagName][subtagName].keys, keys);
    } else {
        doc.tags[tagName][subtagName] = {};
        doc.tags[tagName][subtagName].keys = keys;
        doc.tags[tagName][subtagName].count = 1;
    }
    return doc;
};

/**
 * Create a Tag
 */
exports.createTag = function(req, res) {
    Tags.findOne({user:req.user},function(err, tags) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        setTag(tags);
    });

    var setTag = function(doc){
        if (!doc) {
            doc = new Tags();
            doc.user = req.user;
            doc.tags = {};
        }
        doc.updated = Date.now();

        doc = logicTag(doc, req.body.tag, req.body.keys);

        doc.markModified('tags');
        doc.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(doc);
            }
        });
    };

};

/**
 * Update a Tag
 */
exports.createSubtag = function(req, res) {
    Tags.findOne({user:req.user},function(err, tags) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        setSubtag(tags);
    });

    var setSubtag = function(doc){
        if (!doc) {
            doc = new Tags();
            doc.user = req.user;
            doc.tags = {};
        }
        doc.updated = Date.now();
        doc = logicTag(doc, req.body.tag, null);
        doc = logicSubtag(doc, req.body.tag, req.body.subtag, req.body.keys);
        doc.markModified('tags');
        doc.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(doc);
            }
        });
    };
};

/**
 * Tags of User
 */
exports.get = function(req, res) {
    Tags.findOne({user:req.user},function(err, tags) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(tags);
        }
    });
};

exports.mergeUsersTags = function (user, userToDel){
    Tags.findOne({user:user}).exec(function(err, tags) {
        if(!tags){
            tags = new Tags();
            tags.user = user;
            tags.tags = {};
        }
        Tags.findOne({user:userToDel}).exec(function(err, tagsToDel) {
            if(tagsToDel){
                if(tagsToDel.tags){
                    tags.tags = _.merge(tagsToDel.tags, tags.tags);
                    tags.markModified('tags');
                }
                tagsToDel.remove();
                tags.updated = Date.now();
                tags.save();
            }
        });
    });
};
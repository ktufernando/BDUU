'use strict';

var errorHandler = require('./errors'),
    winston = require('winston'),
    neo4j = require('seraph')(),
    model = require('seraph-model'),
    Knowledge = model(neo4j, 'Knowledge'),
    User = model(neo4j, 'User'),
    _ = require('lodash'),
    s = require('string'),
    async = require('async');

Knowledge.schema = {
    name: {
        type: String,
        trim: true,
        required: true
    },
    date: {
        type: Date
    },
    count: {
        type: Number
    }
};
Knowledge.setUniqueKey('name');

User.schema = {
    email: {
        type: String,
        trim: true,
        required: true
    },
    date: {
        type: Date
    },
    count: {
        type: Number
    }
};
User.setUniqueKey('email');

Knowledge.compose(Knowledge, 'parents', 'parent');
User.compose(Knowledge, 'knowledges', 'known');

var cleanStr = function(str){
    return s(str).strip('*','/','\'','"','.').capitalize().camelize().s;
};

var cleanArrayStr = function(array){
    if(_.isEmpty(array)) return array;
    for(var i in array){
        array[i] = cleanStr(array[i]);
    }
    return array;
};


/**
 * Module dependencies.
 */
exports.addKnowledge = function(req, res, next) {

    // Si el request trae padres, validar que existan
    winston.info('Add Knowledge in progress. Request body: ', req.body);
    var name = cleanStr(req.body.name);
    winston.info('Name : ', name);
    if(!name){
        return res.status(400).send({
            message: 'Knowledge Name is required.'
        });
    }
    var parents = cleanArrayStr(req.body.parents);
    winston.info('Parents : ', parents);

    async.waterfall([
        function(done) {
            if(!_.isEmpty(parents)){
                var queryParents = 'MATCH (k:Knowledge) WHERE 1=1 AND ';
                for(var i = 0; i < parents.length; i++){
                    queryParents = queryParents + ' k.name = \'' + parents[i] + '\'';
                    if(i !== parents.length-1) queryParents = queryParents + ' XOR ';
                }
                queryParents = queryParents + ' RETURN k';
                winston.info('Search Parents Knowledges. Query: ', queryParents);
                neo4j.query(queryParents, function(err, result) {
                    winston.info(JSON.stringify(result));
                    var finalParents = [];
                    _.forEach(parents, function(p){
                        var contain = false;
                        _.forEach(result, function(r){
                            if(r.name === p){
                                contain = true;
                                finalParents.push(r);
                            }
                        });
                        if(!contain){
                            finalParents.push({
                                name: p,
                                date: new Date(),
                                count: 0
                            });
                        }
                    });
                    winston.info(JSON.stringify(finalParents));
                    done(err, finalParents);
                });
            }else{
                done(undefined, []);
            }
        },
        function(p, done) {
            Knowledge.where({name: name}, function (err, k) {
                if (err) {
                    done(err, 'done');
                }
                var kToSave = {
                    name : name,
                    date : new Date(),
                    count : 0
                };
                if (k && k.length > 0) {
                    kToSave.id = k[0].id;
                    if(p && p.length > 0){
                        kToSave.parents = _.merge(p, k[0].parents);
                    }
                }else{
                    if(p && p.length > 0){
                        kToSave.parents = p;
                    }
                }

                winston.info('Object to Save: ', kToSave);

                Knowledge.save(kToSave, function(err, saved) {
                    winston.info('saved: ', saved);
                    done(err);
                    return res.jsonp(saved);
                 });
            });
        }
    ], function(err) {
        if (err) return next(err);
    });

};

/**
 * Module dependencies.
 */
exports.knowingUser = function(req, res, next) {

    var email = req.body.email;
    if (!email) {
        email = req.ip + '@provincianet.com';
    }
    var knowledges = req.body.tags;
    var appName = req.body.appName;

    async.waterfall([
        function(done) {
            winston.info('Search User on Neo4j.');
            User.where({email: email}, function (err, result) {
                if (err) {
                    winston.error(err);
                    done(err, 'done');
                }
                if (_.isEmpty(result)) {
                    done(err, {email:email, date: new Date()});
                } else {
                    winston.info('User Result: ', JSON.stringify(result));
                    done(err, result[0]);
                }
            });
        },
        function(user, done) {
            if(!_.isEmpty(knowledges)){
                var queryK = 'MATCH (k:Knowledge) WHERE 1=1 AND ';
                for(var i = 0; i < knowledges.length; i++){
                    queryK = queryK + ' k.name = \'' + knowledges[i] + '\'';
                    if(i !== knowledges.length-1) queryK = queryK + ' XOR ';
                }
                queryK = queryK + ' RETURN k';
                winston.info('Search Knowledges. Query: ', queryK);
                neo4j.query(queryK, function(err, result) {
                    _.forEach(result, function(r){
                        var contains = false;
                        _.forEach(user.knowledges, function(k){
                            if(k.id === r.id){
                                contains = true;
                                k.count++;
                            }
                        });
                        if(!contains){
                            if(!user.knowledges)user.knowledges = [];
                            r.count++;
                            user.knowledges.push(r);
                        }
                    });
                    done(err, user, result);
                });
            }else{
                return res.status(400).send({
                    message: 'Tags ir required.'
                });
            }
        },
        function(user, knowledges, done) {
            winston.info('final user: ', user);
            User.save(user, function(err, saved) {
                winston.info('saved: ', saved);
                neo4j.relationships(saved, function(err, rels) {
                    winston.info('Relationships: ', JSON.stringify(rels));
                    _.forEach(rels, function(r){
                        _.forEach(knowledges, function(k) {
                            if (k.id === r.end) {
                                if (r.properties[appName]) {
                                    r.properties[appName]++;
                                } else {
                                    r.properties[appName] = 1;
                                }
                                neo4j.rel.update(r, function(err){
                                    if(err){
                                        winston.error(err);
                                    }
                                });
                            }
                        });
                    });
                });
                done(err);
                return res.jsonp(saved);
            });
        }
    ], function(err) {
        if (err) return next(err);
    });
};

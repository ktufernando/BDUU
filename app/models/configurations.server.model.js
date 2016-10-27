'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var UserConfigurationsSchema = new Schema({
    user: {
		type: Schema.ObjectId,
		ref: 'User',
        index: true
	},
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    global: {},
    applications:{}
});

mongoose.model('User.Configurations', UserConfigurationsSchema);
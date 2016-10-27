'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var DynamicDataSchema = new Schema({
    user: {
		type: Schema.ObjectId,
		ref: 'User',
        index: true
	},
    applications: {},
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Dynamic.User.Data', DynamicDataSchema);
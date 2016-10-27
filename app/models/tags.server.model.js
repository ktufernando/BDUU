'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var TagsSchema = new Schema({
	tags:{},
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
    }
});

mongoose.model('User.Tags', TagsSchema);
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	jwt = require('jwt-simple'),
	moment = require('moment');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 7));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
        unique: 'testing error message',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true,
        index: true
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
    personalInfo: {
        gender:{
            type: String,
            enum: ['MASCULINO', 'FEMENINO', null]
        },
        document:{
            docType:{
                type: String,
                enum: ['DNI', 'CI', 'LE', 'LC', 'CUIT', 'CUIL', null]
            },
            docNumber: Number
        },
        birthDate: {
            day: Number,
            month: Number,
            year: Number
        },
        nationality: String,
        webSite: String,
        telephones: [{
            areaCode: String,
            number: String,
            telType: {
                type: String,
                enum: ['PERSONAL', 'LABORAL', 'CELULAR', 'ADICIONAL', null]
            },
            telCompany: {
                type: String,
                enum: ['MOVISTAR', 'PERSONAL', 'CLARO', 'NEXTEL', null]
            }
        }],
        addresses: [{
            street: String,
            number: String,
            floor: String,
            dep: String,
            city: String,
            state: String,
            country: String,
            postcode: String,
            addressType: {
                type: String,
                enum: ['PERSONAL', 'LABORAL', 'ADICIONAL', null]
            }
        }]
    },
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
    /* For verification mail*/
    status:{
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    verified:{
        type: Boolean,
        default: false
    },
    verificationToken: String,
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
  	resetPasswordExpires: {
  		type: Date
  	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 7) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

/**
 * Create JWT Token
 */
UserSchema.methods.createJWTToken = function(secret) {
	var expires = moment().add(7, 'days').valueOf();
	var that = this;
	var token = jwt.encode({
		iss: that._id,
		expires: expires
	}, secret);
	return {token:token,expires:expires};
};

var User = mongoose.model('User', UserSchema);



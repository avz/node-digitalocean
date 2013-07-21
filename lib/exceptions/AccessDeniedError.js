var ApiError = require('./ApiError.js').ApiError;
var util = require('util');

var AccessDeniedError = function(msg) {
	AccessDeniedError.super_.call(this, msg, this.constructor);
};
util.inherits(AccessDeniedError, ApiError);
AccessDeniedError.prototype.name = 'digitalocean::AccessDeniedError';

exports.AccessDeniedError = AccessDeniedError;

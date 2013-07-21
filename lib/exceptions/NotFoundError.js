var ApiError = require('./ApiError.js').ApiError;
var util = require('util');

var NotFoundError = function(msg) {
	NotFoundError.super_.call(this, msg, this.constructor);
};
util.inherits(NotFoundError, ApiError);
NotFoundError.prototype.name = 'digitalocean::NotFoundError';

exports.NotFoundError = NotFoundError;

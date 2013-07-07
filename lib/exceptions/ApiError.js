var Error = require('./Error.js').Error;
var util = require('util');

var ApiError = function (msg) {
	ApiError.super_.call(this, msg, this.constructor);
};
util.inherits(ApiError, Error);
ApiError.prototype.name = 'digitalocean::ApiError';

exports.ApiError = ApiError;

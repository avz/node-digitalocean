var Error = require('./Error.js').Error;
var util = require('util');

var ArgumentError = function (msg) {
	ArgumentError.super_.call(this, msg, this.constructor);
};
util.inherits(ArgumentError, Error);
ArgumentError.prototype.name = 'digitalocean::ArgumentError';

exports.ArgumentError = ArgumentError;

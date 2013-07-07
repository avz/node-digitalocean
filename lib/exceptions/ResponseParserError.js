var Error = require('./Error.js').Error;
var util = require('util');

var ResponseParserError = function(msg) {
	ResponseParserError.super_.call(this, msg, this.constructor);
};

util.inherits(ResponseParserError, Error);

ResponseParserError.prototype.name = 'digitalocean::ResponseParserError';

exports.ResponseParserError = ResponseParserError;

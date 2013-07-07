var util = require('util');

var Error = function(msg, constr) {
	global.Error.captureStackTrace(this, constr || this);
	this.message = msg;
};

util.inherits(Error, global.Error);

Error.prototype.name = 'digitalocean::Error';

exports.Error = Error;

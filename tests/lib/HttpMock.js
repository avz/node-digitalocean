var common = require('./common.js');
var EventEmitter = require('events').EventEmitter;

exports.HttpMock = function() {
	this.map = {};
};

exports.HttpMock.prototype.get = function(url, onResponse) {
	var map = this.map;
	var self = this;

	for(var wurl in map) {
		if(common.urlsIsEqual(url, wurl)) {
			var res = new EventEmitter();
			res.headers = {};

			onResponse(res);

			var body = this.map[wurl];
			if(body instanceof Buffer) {

			} else if(body instanceof Object) {
				body = new Buffer(JSON.stringify(body));
			} else {
				body = new Buffer(body);
			}

			process.nextTick(function() {
				var om = self.map;
				self.map = map;

				res.emit('data', body);
				res.emit('end');

				self.map = om;
			});

			return res;
		}
	}

	throw new Error('Unexpected request url: ' + url);
};

exports.HttpMock.prototype.wrap = function(urlMap, runner) {
	this.map = urlMap;

	runner();

	this.map = {};
};

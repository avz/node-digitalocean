var https = require('https');
var url = require('url');
var querystring = require('querystring');
var util = require('util');
var LowLevelApi = require('./LowLevelApi.js').LowLevelApi;
var ApiError = require('./exceptions/ApiError.js').ApiError;
var EventEmitter = require('events').EventEmitter;

var entities = require('./entities.js');

function Api(clientId, apiKey) {
	var self = this;

	this.lowLevelApi = new LowLevelApi(https, 'https://api.digitalocean.com/', clientId, apiKey);

	this.droplets = _entityRootFactory(this, 'droplet', entities.Droplet);
	this.images = _entityRootFactory(this, 'image', entities.Image);

	this.images.my = function(onComplete) {
		return self.images.all({filter: 'my_images'}, onComplete);
	};

	this.images.global = function(onComplete) {
		return self.images.all({filter: 'global'}, onComplete);
	};

	this.ssh_keys = _entityRootFactory(this, 'ssh_key', entities.SshKey);
	this.sizes = _entityRootFactory(this, 'size', entities.Size);
	this.domains = _entityRootFactory(this, 'domain', entities.Domain);
	this.regions = _entityRootFactory(this, 'region', entities.Region);
}

Api.prototype._request = function(relativeUrl, parameters, expectedResponseField) {
	var ee = new EventEmitter;

	this.lowLevelApi.request(relativeUrl, parameters, function(err, result) {
		try {
			if(err)
				throw err;

			if(expectedResponseField) {
				if(!result.response.hasOwnProperty(expectedResponseField))
					throw new ApiError('Expected response field `' + expectedResponseField + '` was not found');
			}
		} catch(e) {
			if(!ee.emit('error', e))
				throw e;

			return;
		}

		if(expectedResponseField)
			ee.emit('response', result.response[expectedResponseField]);
		else
			ee.emit('response', result.response);
	});

	return ee;
};

Api.prototype._action = function(relativeUrl, parameters) {
	return this._request(relativeUrl, parameters);
};

exports.Api = Api;

/* Internal functions */

function _cast(type, data) {
	var o = new type(this);

	o.unserializeFromApiResponse(data);

	return o;
};

function _castArray(type, list) {
	var res = [];
	for(var i = 0; i < list.length; i++)
		res.push(_cast.call(this, type, list[i]));

	return res;
};

function _entityRootFactory(parent, name, type) {
	var mname = name + 's';

	var method = {};

	method.get = function(id, onComplete) {
		return parent._request('/' + mname + '/' + id, {}, name).on('response', function(obj) {
			var res = _cast.call(parent, type, obj);

			this.emit('success', res);
			if(onComplete)
				onComplete(res);
		});
	};

	method.all = function(params, onComplete) {
		onComplete = params instanceof Function ? params : onComplete;
		params = params instanceof Function ? {} : params;

		return parent._request('/' + mname, params, mname).on('response', function(list) {
			var res = _castArray.call(parent, type, list);

			this.emit('success', res);
			if(onComplete)
				onComplete.call(this, res);
		});
	};

	method.new = function(params, onComplete) {
		return parent._request('/' + mname + '/new', params, name).on('response', function(list) {
			var res = _cast.call(parent, type, list);

			this.emit('success', res);
			if(onComplete)
				onComplete.call(this, res);
		});
	};

	return method;
};

var https = require('https');
var url = require('url');
var querystring = require('querystring');
var util = require('util');
var LowLevelApi = require('./LowLevelApi.js').LowLevelApi;
var ApiError = require('./exceptions/ApiError.js').ApiError;
var EventEmitter = require('events').EventEmitter;
var entityRootFactory = require('./templates').entityRootFactory;

var entities = require('./entities.js');

function Api(clientId, apiKey) {
	var self = this;

	this.lowLevelApi = new LowLevelApi(https, 'https://api.digitalocean.com/', clientId, apiKey);

	this.droplets = entityRootFactory(this, 'droplet', entities.Droplet);
	this.images = entityRootFactory(this, 'image', entities.Image);

	this.images.my = function(onComplete) {
		return self.images.all({filter: 'my_images'}, onComplete);
	};

	this.images.global = function(onComplete) {
		return self.images.all({filter: 'global'}, onComplete);
	};

	this.ssh_keys = entityRootFactory(this, 'ssh_key', entities.SshKey);
	this.sizes = entityRootFactory(this, 'size', entities.Size);
	this.domains = entityRootFactory(this, 'domain', entities.Domain);
	this.regions = entityRootFactory(this, 'region', entities.Region);
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

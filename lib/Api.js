var https = require('https');
var url = require('url');
var querystring = require('querystring');
var util = require('util');
var LowLevelApi = require('./LowLevelApi.js').LowLevelApi;
var ApiError = require('./exceptions/ApiError.js').ApiError;
var EventEmitter = require('events').EventEmitter;
var EntityRestRoot = require('./EntityRestRoot.js').EntityRestRoot;

var entities = require('./entities.js');

function Api(clientId, apiKey) {
	var self = this;

	this.lowLevelApi = new LowLevelApi(https, 'https://api.digitalocean.com/', clientId, apiKey);

	this.droplets = new EntityRestRoot(this, 'droplet', '/droplets', entities.Droplet);
	this.images = new EntityRestRoot(this, 'image', '/images', entities.Image);

	this.images.my = function(onComplete) {
		return self.images.all({filter: 'my_images'}, onComplete);
	};

	this.images.global = function(onComplete) {
		return self.images.all({filter: 'global'}, onComplete);
	};

	this.ssh_keys = new EntityRestRoot(this, 'ssh_key', '/ssh_keys', entities.SshKey);
	this.sizes = new EntityRestRoot(this, 'size', '/sizes', entities.Size);
	this.events = new EntityRestRoot(this, 'event', '/events', entities.Event);
	this.domains = new EntityRestRoot(this, 'domain', '/domains', entities.Domain);
	this.regions = new EntityRestRoot(this, 'region', '/regions', entities.Region);
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

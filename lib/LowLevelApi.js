var url = require('url');
var ResponseParserError = require('./exceptions/ResponseParserError.js').ResponseParserError;
var ApiError = require('./exceptions/ApiError.js').ApiError;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function LowLevelApi(httpClient, apiUrl, clientId, apiKey) {
	if(!url.parse(apiUrl).hostname)
		throw new Error('Bad apiUrl');

	this.httpClient = httpClient;
	this.apiUrl = apiUrl;
	this.clientId = clientId;
	this.apiKey = apiKey;
};

util.inherits(LowLevelApi, EventEmitter);

LowLevelApi.prototype._generateUrlObject = function(relativeUrl, parameters) {
	var up = url.parse(this.apiUrl, true);

	if(up.pathname.substr(-1) !== '/')
		up.pathname += '/';

	if(relativeUrl.substr(0, 1) === '/')
		relativeUrl = relativeUrl.substr(1);

	up.pathname += relativeUrl;

	delete up.path;
	delete up.search;

	up.query['client_id'] = this.clientId;
	up.query['api_key'] = this.apiKey;

	if(parameters) {
		if(typeof(parameters) !== 'object')
			throw new Error('Object expected in argument `parameters`')

		for(var p in parameters) {
			if(up.query.hasOwnProperty(p))
				throw new Error('Query parameters overriding is not allowed (argument `parameters.' + p + '`)');

			if(parameters[p] instanceof Array)
				up.query[p] = parameters[p].join(',');
			else
				up.query[p] = parameters[p];
		}
	}

	var fullUrl = url.format(up);

	this.emit('request', fullUrl);

	return fullUrl;
};

LowLevelApi._parseResponse = function(buffer) {
	try {
		var response = JSON.parse(buffer.toString('utf-8'));
	} catch(e) {
		throw new ResponseParserError('Unable to parse JSON: ' + e);
	}

	var result;

	try {
		if(!response.hasOwnProperty('status'))
			throw new ResponseParserError('Field `status` not found');

		if(response.status === 'OK') {
			result = {
				success: true,
				error: undefined,
				response: response
			};
		} else {
			result = {
				success: false,
				error: {
					status: response.status,
					message: response.message ? response.message : response.error_message
				},
				response: response
			};
		}
	} catch(e) {
		if(e instanceof ResponseParserError)
			throw e;

		throw new ResponseParserError('Invalid response: ' + e);
	}

	return result;
};

LowLevelApi.prototype.request = function(relativeUrl, parameters, onComplete) {
	var fullUrl = url.format(this._generateUrlObject(relativeUrl, parameters));

	var bodyBuffer = new Buffer(1024);
	var bodyBufferRealLength = 0;

	var status;

	function onBodyChunk(chunk) {
		if(chunk.length + bodyBufferRealLength > bodyBuffer.length) {
			var newBodyBuffer = new Buffer(Math.max(bodyBuffer.length * 2, chunk.length + bodyBufferRealLength));
			bodyBuffer.copy(newBodyBuffer, 0, 0, bodyBufferRealLength);

			bodyBuffer = newBodyBuffer;
		}

		chunk.copy(bodyBuffer, bodyBufferRealLength);
		bodyBufferRealLength += chunk.length;
	};

	function onBodyCompleted() {
		try {
			var result = LowLevelApi._parseResponse(bodyBuffer.slice(0, bodyBufferRealLength));
			if(result.error) {
				result.error.code = status;
				throw new ApiError(result.error.message, result);
			}

			onComplete(undefined, result);
		} catch(e) {
			onComplete(e);
		}
	};

	this.httpClient.get(fullUrl, function(res) {
		status = res.headers.status;

		res.on('data', onBodyChunk);
		res.on('end', onBodyCompleted);
	}).on('error', function(err) {
		onComplete(err);
	});
};

exports.LowLevelApi = LowLevelApi;

var Api = require('../lib/Api.js').Api;
var common = require('./lib/common.js');
var EventEmitter = require('events').EventEmitter;

var httpMock = {
};

httpMock.get = function(url, onRequest) {
	var uf = common.urlFingerprint(url);
	var response;
	var status;

	switch(uf) {
		case common.urlFingerprint('https://api.digitalocean.com/ssh_keys?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				"status": "OK",
				"ssh_keys": [
					{
						"id": 10,
						"name": "office-imac"
					},
					{
						"id": 11,
						"name": "macbook-air"
					}
				]
			};
		break;
		case common.urlFingerprint('https://api.digitalocean.com/ssh_keys/10?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				"status": "OK",
				"ssh_key": {
					"id": 10,
					"name": "office-imac"
				}
			};
		break;
		case common.urlFingerprint('https://api.digitalocean.com/ssh_keys/100500?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				status: 'ERROR',
				message: 'Not Found'
			};
		break;
		case common.urlFingerprint('https://api.digitalocean.com/ssh_keys/10/destroy?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				status: "OK"
			};
		break;
		default:
			throw new Error('Unexpected request to URL: ' + url);
	}

	process.nextTick(function() {
		var res = new EventEmitter;
		res.headers = {
			status: status
		};
		onRequest(res);

		res.emit('data', new Buffer(JSON.stringify(response)));
		res.emit('end');
	});

	return new EventEmitter;
};

var api = new Api('CLIENTID', 'APIKEY');
api.lowLevelApi.httpClient = httpMock;

api.ssh_keys.all(function(list) {
	if(
		!common.hasEqualProperties(list[0], {id: 10, name: "office-imac"})
		||
		!common.hasEqualProperties(list[1], {id: 11, name: "macbook-air"})
	) {
		throw new Error();
	}
});

api.ssh_keys.get(10, function(key) {
	if(!common.hasEqualProperties(key, {id: 10, name: "office-imac"})) {
		throw new Error();
	}
});

api.ssh_keys.get(100500, function(key) {
	throw new Error();
}).on('error', function(e) {
	if(e.message !== 'Not Found')
		throw new Error;
});

api.ssh_keys.get(10, function(key) {
	key.destroy(function(r) {
		if(!common.hasEqualProperties(r, {status: 'OK'})) {
			throw new Error();
		}
	});
});

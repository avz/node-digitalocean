var Api = require('../lib/Api.js').Api;
var common = require('./lib/common.js');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

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
		case common.urlFingerprint('https://api.digitalocean.com/domains/12?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				status: "OK",
				domain: {
					id: 12,
					name: 'google.com',
					ttl: 1800,
					live_zone_file: 'ZONE_FILE'
				}
			};
		break;
		case common.urlFingerprint('https://api.digitalocean.com/domains/12/records/10?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				status: "OK",
				record: {
					id: 10,
					domain_id: 12,
					name: 'google.com'
				}
			};
		break;
		case common.urlFingerprint('https://api.digitalocean.com/domains/12/records/10/destroy?client_id=CLIENTID&api_key=APIKEY'):
			response = {
				status: 'ERROR',
				message: 'Not Found'
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
	assert(
		common.hasEqualProperties(list[0], {id: 10, name: "office-imac"})
		&&
		common.hasEqualProperties(list[1], {id: 11, name: "macbook-air"})
	);
});

api.ssh_keys.get(10, function(key) {
	assert(common.hasEqualProperties(key, {id: 10, name: "office-imac"}))
});

api.ssh_keys.get(100500, function(key) {
	throw new Error();
}).on('error', function(e) {
	assert(e.message === 'Not Found');
});

api.ssh_keys.get(10, function(key) {
	key.destroy(function(r) {
		assert(common.hasEqualProperties(r, {status: 'OK'}));
	});
});

api.domains.get(12, function(domain) {
	assert(
		common.hasEqualProperties(domain, {id: 12, name: 'google.com', ttl: 1800, live_zone_file: 'ZONE_FILE'})
	);

	domain.records.get(10, function(r) {
		assert(common.hasEqualProperties(r, {id: 10, domain_id: 12, name: 'google.com'}));

		r.destroy(function() {
			assert(false);
		}).on('error', function(e) {
			assert(e.message === 'Not Found');
		});
	});
});

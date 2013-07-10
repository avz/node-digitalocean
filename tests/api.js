var Api = require('../lib/Api.js').Api;
var common = require('./lib/common.js');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var HttpMock = require('./lib/HttpMock.js').HttpMock;

var api = new Api('CLIENTID', 'APIKEY');
var httpMock = new HttpMock();
api.lowLevelApi.httpClient = httpMock;

httpMock.wrap({
	'https://api.digitalocean.com/ssh_keys?client_id=CLIENTID&api_key=APIKEY': {
		status: "OK",
		ssh_keys: [{id: 10, name: "office-imac"}, {id: 11, name: "macbook-air"}]
	}
}, function() {
	api.ssh_keys.all(function(list) {
		assert(
			common.hasEqualProperties(list[0], {id: 10, name: "office-imac"})
			&&
			common.hasEqualProperties(list[1], {id: 11, name: "macbook-air"})
		);
	});
});

httpMock.wrap({
	'https://api.digitalocean.com/ssh_keys/10?client_id=CLIENTID&api_key=APIKEY': {
		status: "OK",
		ssh_key: {id: 10, name: "office-imac"}
	}
}, function() {
	api.ssh_keys.get(10, function(key) {
		assert(common.hasEqualProperties(key, {id: 10, name: "office-imac"}));
	});
});

httpMock.wrap({
	'https://api.digitalocean.com/ssh_keys/100500?client_id=CLIENTID&api_key=APIKEY': {
		status: 'ERROR',
		message: 'Not Found'
	}
}, function() {
	api.ssh_keys.get(100500, function(key) {
		throw new Error();
	}).on('error', function(e) {
		assert(e.message === 'Not Found');
	});
});

httpMock.wrap({
	'https://api.digitalocean.com/ssh_keys/10?client_id=CLIENTID&api_key=APIKEY': {
		status: "OK",
		ssh_key: {id: 10, name: "office-imac"}
	},
	'https://api.digitalocean.com/ssh_keys/10/destroy?client_id=CLIENTID&api_key=APIKEY': {
		status: 'OK'
	}
}, function() {
	api.ssh_keys.get(10, function(key) {
		key.destroy(function(r) {
			assert(common.hasEqualProperties(r, {status: 'OK'}));
		});
	});
});

httpMock.wrap({
	'https://api.digitalocean.com/domains/12?client_id=CLIENTID&api_key=APIKEY': {
		status: "OK",
		domain: {
			id: 12,
			name: 'google.com',
			ttl: 1800,
			live_zone_file: 'ZONE_FILE'
		}
	},
	'https://api.digitalocean.com/domains/12/records/10?client_id=CLIENTID&api_key=APIKEY': {
		status: "OK",
		record: {
			id: 10,
			domain_id: 12,
			name: 'google.com'
		}
	},
	'https://api.digitalocean.com/domains/12/records/10/destroy?client_id=CLIENTID&api_key=APIKEY': {
		status: 'ERROR',
		message: 'Not Found'
	}
}, function() {
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
});

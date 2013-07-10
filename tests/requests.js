var LowLevelApi = require('../lib/LowLevelApi.js').LowLevelApi;
var HttpMock = require('./lib/HttpMock.js').HttpMock;

var httpMock = new HttpMock;
var api = new LowLevelApi(httpMock, 'http://localhost/', 'CLIENTID', 'APIKEY');

httpMock.wrap({
	'http://localhost/?client_id=CLIENTID&api_key=APIKEY': ''
}, function() {
	api.request('/', {}, function() {});
});

httpMock.wrap({
	'http://localhost/hello/?client_id=CLIENTID&api_key=APIKEY': ''
}, function() {
	api.request('/hello/', {}, function() {});
});

httpMock.wrap({
	'http://localhost/hello/?client_id=CLIENTID&api_key=APIKEY&a=b&b=c': ''
}, function() {
	api.request('/hello/', {a: 'b', b: 'c'}, function() {});
});

httpMock.wrap({
	'http://localhost/hello/?client_id=CLIENTID&api_key=APIKEY&array=1%2C2%2C3%2C4': ''
}, function() {
	api.request('/hello/', {array: [1, 2, 3, 4]}, function() {});
});


var LowLevelApi = require('../lib/LowLevelApi.js').LowLevelApi;
var common = require('./lib/common.js');

var tests = [
	{
		rel: '/',
		resultUrl: 'http://localhost/?client_id=CLIENTID&api_key=APIKEY'
	},
	{
		rel: '/hello/',
		resultUrl: 'http://localhost/hello/?client_id=CLIENTID&api_key=APIKEY'
	},
	{
		rel: '/hello/',
		params: {a: 'b', b: 'c'},
		resultUrl: 'http://localhost/hello/?client_id=CLIENTID&api_key=APIKEY&a=b&b=c'
	}
];

var httpMock = {
	lastUrl: undefined
};

httpMock.get = function(url) {
	this.lastUrl = url;

	return {on: function() {}};
};

var api = new LowLevelApi(httpMock, 'http://localhost/', 'CLIENTID', 'APIKEY');

for(var i = 0; i < tests.length; i++) {
	var test = tests[i];

	httpMock.lastUrl = undefined;

	api.request(test.rel, test.params ? test.params : {}, function() {});

	if(!common.urlsIsEqual(httpMock.lastUrl, test.resultUrl)) {
		console.error('Failed test:', test, httpMock.lastUrl);
		process.exit(1);
	}
}

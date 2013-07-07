var LowLevelApi = require('../lib/LowLevelApi').LowLevelApi;
var common = require('./lib/common.js');

var tests = [
	{
		input: 'broken JSON',
		exception: 'digitalocean::ResponseParserError: Unable to parse JSON: SyntaxError: Unexpected token b'
	},
	{
		input: '{}',
		exception: 'digitalocean::ResponseParserError: Field `status` not found'
	},
	{
		input: '{"status": "OK"}',
		output: {success: true, error: undefined, response: {status: 'OK'}}
	},
	{
		input: '{"status": "OK", "droplets": []}',
		output: {success: true, error: undefined, response: {status: 'OK', droplets: []}}
	},
	{
		input: '{"status": "ERROR"}',
		output: {success: false, error: {status: 'ERROR', message: undefined}, response: {status: 'ERROR'}}
	},
	{
		input: '{"status": "ERROR", "message": "Access Denied"}',
		output: {success: false, error: {status: 'ERROR', message: 'Access Denied'}, response: {status: 'ERROR', message: 'Access Denied'}}
	}
];

for(var i = 0; i < tests.length; i++) {
	try {
		var test = tests[i];

		var b = new Buffer(test.input);

		try {
			var result = LowLevelApi._parseResponse(b);
		} catch(e) {
			if(!test.exception)
				throw e;

			var es = e.toString();

			if(test.exception instanceof RegExp) {
				if(!test.exceptionMatch.test(es))
					throw e;
			} else if(test.exception instanceof Function) {
				if(!(e instanceof test.exception))
					throw e;
			} else {
				if(es !== test.exception)
					throw e;
			}
		}

		if(test.hasOwnProperty('output')) {
			if(common.hashesIsEqual(test.output, result))
				throw new Error("Unexpected result");
		}
	} catch(e) {
		console.error('Failed test:', test);
		throw e;
	}
}

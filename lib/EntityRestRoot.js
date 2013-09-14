exports.EntityRestRoot = function(api, name, path, type) {
	this.path = path;
	this.api = api;

	function cast(type, data) {
		var o = new type(this);

		o.unserializeFromApiResponse(data);

		return o;
	};

	function castArray(type, list) {
		var res = [];
		for(var i = 0; i < list.length; i++)
			res.push(cast.call(this, type, list[i]));

		return res;
	};

	var mname = name + 's';

	this.get = function(id, onComplete) {
		return api._request(this.path + '/' + id, {}, name).on('response', function(obj) {
			var res = cast.call(api, type, obj);

			this.emit('success', res);
			if(onComplete)
				onComplete(res);
		});
	};

	this.all = function(params, onComplete) {
		onComplete = params instanceof Function ? params : onComplete;
		params = params instanceof Function ? {} : params;

		return api._request(this.path, params, mname).on('response', function(list) {
			var res = castArray.call(api, type, list);

			this.emit('success', res);
			if(onComplete)
				onComplete.call(this, res);
		});
	};

	this.new = function(params, onComplete) {
		return api._request(this.path + '/new', params, name).on('response', function(list) {
			var res = cast.call(api, type, list);

			this.emit('success', res);
			if(onComplete)
				onComplete.call(this, res, res.event_id);
		});
	};

	if(type._restRootExports) {
		for(var i = 0; i < type._restRootExports.length; i++) {
			var method = type._restRootExports[i];

			this[method] = (function(type, method) { return function(id /* ... */) {
				var args = Array.prototype.slice.apply(arguments);
				args.shift();

				var fakeEntity = new type(api, name);
				fakeEntity.id = id;

				return fakeEntity[method].apply(fakeEntity, args);
			}})(type, method);
		}
	}
};

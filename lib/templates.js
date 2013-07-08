exports.entityRootFactory = function(parent, name, type) {
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

	var method = {
		rootUrl: ''
	};

	method.get = function(id, onComplete) {
		return parent._request(this.rootUrl + '/' + mname + '/' + id, {}, name).on('response', function(obj) {
			var res = cast.call(parent, type, obj);

			this.emit('success', res);
			if(onComplete)
				onComplete(res);
		});
	};

	method.all = function(params, onComplete) {
		onComplete = params instanceof Function ? params : onComplete;
		params = params instanceof Function ? {} : params;

		return parent._request(this.rootUrl + '/' + mname, params, mname).on('response', function(list) {
			var res = castArray.call(parent, type, list);

			this.emit('success', res);
			if(onComplete)
				onComplete.call(this, res);
		});
	};

	method.new = function(params, onComplete) {
		return parent._request(this.rootUrl + '/' + mname + '/new', params, name).on('response', function(list) {
			var res = cast.call(parent, type, list);

			this.emit('success', res);
			if(onComplete)
				onComplete.call(this, res);
		});
	};

	return method;
};

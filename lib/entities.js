var util = require('util');
var ArgumentError = require('./exceptions/ArgumentError.js').ArgumentError;

function ApiEntity(api) {
	this.api = api;
};

ApiEntity.prototype.unserializeFromApiResponse = function(r) {
	for(var f in r) {
		if(!this.hasOwnProperty(f))
			this[f] = r[f];
	}

	this._wakeup();
};

ApiEntity.prototype._wakeup = function() {
};

ApiEntity.prototype._getRelativeUrl = function() {
	return '/' + this._name + 's/' + this.id;
};

function _entityTemplate(name, actions) {
	var ctor = function(api) {
		this.constructor.super_.call(this, api);
		this._name = name;
	};

	util.inherits(ctor, ApiEntity);

	if(actions)
		_registerActions(ctor, actions);

	return ctor;
}

function _createAction(action, mandatoryParams) {
	return function(arg1, arg2) {
		var params = {};
		var onComplete = undefined;

		if(arg1 instanceof Function)
			onComplete = arg1;
		else if(arg1 instanceof Object)
			params = arg1;

		if(arg2)
			onComplete = arg2;

		for(var i = 0; i < mandatoryParams.length; i++) {
			var p = mandatoryParams[i];
			if(!params.hasOwnProperty(p))
				throw new ArgumentError('Mandatory argument `' + p + '` is not specified');
		}

		return this.api._action(
			this._getRelativeUrl() + '/' + action,
			params,
			onComplete
		).on('response', function(res) {
			this.emit('success', res);

			if(onComplete)
				onComplete(res);
		});
	};
}

function _registerActions(ctor, actions) {
	for(var action in actions)
		ctor.prototype[action] = _createAction(action, actions[action]);
}

var Droplet = _entityTemplate(
	'droplet',
	{
		reboot: [],
		power_cycle: [],
		shutdown: [],
		power_off: [],
		power_on: [],
		password_reset: [],
		resize: ['size_id'],
		snapshot: ['name'],
		restore: ['image_id'],
		rebuild: ['image_id'],
		enable_backups: [],
		disable_backups: [],
		rename: ['name'],
		destroy: []
	}
);

Droplet.prototype._wakeup = function() {
	this.created_at = new Date(this.created_at);
};

var Image = _entityTemplate(
	'image',
	{
		transfer: ['region_id'],
		destroy: []
	}
);

var Region = _entityTemplate('region');
var SshKey = _entityTemplate(
	'ssh_key',
	{
		destroy: []
	}
);
var Size = _entityTemplate('size');
var Domain = _entityTemplate('domain');
var DomainRecord = _entityTemplate();

exports.Droplet = Droplet;
exports.Image = Image;
exports.Region = Region;
exports.SshKey = SshKey;
exports.Size = Size;
exports.Domain = Domain;

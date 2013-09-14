var util = require('util');
var ArgumentError = require('./exceptions/ArgumentError.js').ArgumentError;
var Api = require('./Api.js').Api;
var EntityRestRoot = require('./EntityRestRoot.js').EntityRestRoot;

function ApiEntity(api, name) {
	Object.defineProperty(this, '_api', {
		value: api,
		enumerable: false
	});

	Object.defineProperty(this, '_name', {
		value: name,
		enumerable: false
	});
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

			return this._api._action(
				this._getRelativeUrl() + '/' + action,
				params,
				onComplete
			).on('response', function(res) {
				this.emit('success', res);

				if(onComplete)
					onComplete(res, res.event_id);
			});
		};
	}

	function _registerActions(ctor, actions) {
		for(var action in actions)
			ctor.prototype[action] = _createAction(action, actions[action]);
	}

	var ctor = function(api) {
		this.constructor.super_.call(this, api, name);
	};

	util.inherits(ctor, ApiEntity);

	if(actions)
		_registerActions(ctor, actions);

	ctor._restRootExports = actions ? Object.keys(actions) : [];

	return ctor;
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
		edit: ['ssh_pub_key'],
		destroy: []
	}
);
var Size = _entityTemplate('size');
var Event = _entityTemplate('event');
var Domain = _entityTemplate(
	'domain',
	{
		destroy: []
	}
);

Domain.prototype._wakeup = function() {
	this.records = new EntityRestRoot(this._api, 'record', '/domains/' + this.id + '/records', DomainRecord);
	this.records.rootUrl = '/domains/' + this.id;
};

var DomainRecord = _entityTemplate(
	'record',
	{
		edit: ['record_type', 'data'],
		destroy: []
	}
);

DomainRecord.prototype._getRelativeUrl = function() {
	return '/domains/' + this.domain_id + '/records/' + this.id;
};

exports.Droplet = Droplet;
exports.Image = Image;
exports.Region = Region;
exports.SshKey = SshKey;
exports.Size = Size;
exports.Event = Event;
exports.Domain = Domain;

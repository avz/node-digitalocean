# DigitalOcean API [![Build Status](https://secure.travis-ci.org/avz/node-digitalocean.png?branch=master)](http://travis-ci.org/avz/node-digitalocean)
## Installation
```
npm install digitalocean
```

## Examples
```javascript
var Api = require('digitalocean').Api;

var api = new Api('CLIENT_ID', 'API_KEY');
```

### Create a new ``droplet``
REST: ``GET /droplets/new``

```javascript
api.droplets.new({
	name: "Droplet name",
	size_id: 1,
	image_id: 123,
	region_id: 1,
	ssh_key_ids: [1212, 343]
}, function(newDroplet) {
	console.log('Created droplet:', newDroplet);
});
```

### Get ``droplet`` by id
REST: ``GET /droplets/121233``

```javascript
var dropletId = 121233;

api.droplets.get(dropletId, function(droplet) {
	console.log('Droplet #' + dropletId, droplet);
});
```

### Reboot a ``droplet``
REST: ``GET /droplets/121233/reboot``

```javascript
var dropletId = 121233;

api.droplets.reboot(dropletId);
```
or another way
```javascript
var dropletId = 121233;

api.droplets.get(dropletId, function(droplet) {
	droplet.reboot();
});
```

## API
Complete API documentation can be found at [https://api.digitalocean.com/](https://api.digitalocean.com/)

### Droplets (``/droplets``)
 - ``Api.droplets.all(onSuccess)`` - get all active droplets
 - ``Api.droplets.get(id, onSuccess)`` - get droplet by id
 - ``Api.droplets.new({name: "Name", size_id: 1, image_id: 1, region_id: 1, ssh_key_ids: [1]}, onSuccess)`` - create new droplet

#### Droplet object
##### Properties
 - ``Droplet.id``
 - ``Droplet.backups_active``
 - ``Droplet.image_id``
 - ``Droplet.name``
 - ``Droplet.region_id``
 - ``Droplet.size_id``
 - ``Droplet.status``

##### Methods
 - ``Droplet.reboot(onSuccess)``
 - ``Droplet.power_cycle(onSuccess)``
 - ``Droplet.shutdown(onSuccess)``
 - ``Droplet.power_off(onSuccess)``
 - ``Droplet.power_on(onSuccess)``
 - ``Droplet.password_reset(onSuccess)``
 - ``Droplet.resize({size_id: 1}, onSuccess)``
 - ``Droplet.snapshot({name: "Name"}, onSuccess)``
 - ``Droplet.restore({image_id: 1}, onSuccess)``
 - ``Droplet.rebuild({image_id: 1}, onSuccess)``
 - ``Droplet.enable_backups(onSuccess)``
 - ``Droplet.disable_backups(onSuccess)``
 - ``Droplet.rename({name: "New name"}, onSuccess)``
 - ``Droplet.destroy(onSuccess)``


### Images (``/images``)
 - ``Api.images.all(onSuccess)`` - get all available images (global and my own)
 - ``Api.images.global(onSuccess)`` - get all available global images
 - ``Api.images.my(onSuccess)`` - get all my own images
 - ``Api.images.get(id, onSuccess)`` - get image by id

#### Image object
##### Properties
 - ``Image.id``
 - ``Image.name``
 - ``Image.distribution``

##### Methods
 - ``Image.transfer({region_id: 1}, onSuccess)``
 - ``Image.destroy(onSuccess)``


### SSH Keys (``/ssh_keys``)
 - ``Api.ssh_keys.all(onSuccess)`` - get *short* info about my SSH keys
 - ``Api.ssh_keys.get(id, onSuccess)`` - get *full* info about specified SSH key
 - ``Api.ssh_keys.new({name: "My new key", ssh_pub_key: "ssh-rsa ... user@host"}, onSuccess)`` - register new SSH key

#### SshKey object
##### Properties
 - ``SshKey.id``
 - ``SshKey.name``
 - ``SshKey.ssh_pub_key`` - *available only in full info*

##### Methods
 - ``SshKey.edit({ssh_pub_key: "ssh-rsa ... user@host"}, onSuccess)``
 - ``SshKey.destroy(onSuccess)``


### Sizes (``/sizes``)
 - ``Api.sizes.all(onSuccess)`` - get *short* info about all available instance types
 - ``Api.sizes.get(id, onSuccess)`` - get *full* info about specified instance type

#### Size object
##### Properties
 - ``Size.id``
 - ``Size.name``
 - ``Size.slug``
 - ``Size.cpu`` - number of CPUs, *available only in full info*
 - ``Size.memory`` - memory amount (in Mb), *available only in full info*
 - ``Size.cost_per_hour`` - price per hour (in dollars), *available only in full info*
 - ``Size.disk`` - disk space (in Gb), *available only in full info*

### Regions (``/regions``)
 - ``Api.regions.all(onSuccess)`` - get all available regions
 - ``Api.regions.get(id, onSuccess)`` - get region by id

#### Region object
##### Properties
 - ``Region.id``
 - ``Region.name``
 - ``Region.slug``


### Domains (``/domains``)
 - ``Api.domains.all(onSuccess)`` - get all domains
 - ``Api.domains.get(id, onSuccess)`` - get domain by id
 - ``Api.domains.new({name: 'example.com', ip_address: '8.8.8.8'}, onSuccess)`` - create new domain

#### Domain object
##### Properties
 - ``Domain.id``
 - ``Domain.name``
 - ``Domain.ttl``
 - ``Domain.live_zone_file``
 - ``Domain.error``
 - ``Domain.zone_file_with_error``
 - ``Domain.records`` - see "Domain Records" section

##### Methods
 - ``Domain.destroy(onSuccess)``

### Domain Records (``/domains/[domain_id]/records``)
 - ``Domain.records.all(onSuccess)``
 - ``Domain.records.get(id, onSuccess)``
 - ``Domain.records.new({domain_id: 1, data: '@', record_type: 'A', name: '8.8.8.8'}, onSuccess)``

#### DomainRecord object
##### Properties
 - ``DomainRecord.id``
 - ``DomainRecord.domain_id``
 - ``DomainRecord.record_type``
 - ``DomainRecord.name``
 - ``DomainRecord.data``
 - ``DomainRecord.priority``
 - ``DomainRecord.port``
 - ``DomainRecord.weight``

##### Methods
 - ``DomainRecord.edit({}, onSuccess)``
 - ``DomainRecord.destroy(onSuccess)``


### Events (``/events``)
 - ``Api.events.get(id, onSuccess)``

#### Event object
##### Properties
 - ``Event.id``
 - ``Event.action_status``
 - ``Event.droplet_id``
 - ``Event.event_type_id``
 - ``Event.percentage``


## Error handling
By default all error will asynchronously throw an error. To catch them
you need to handle ``'error'`` event:

```javascript
api.images.get(12345, function() {
	/* ... */
}).on('error', function(error) {
	console.error(error);
});
```
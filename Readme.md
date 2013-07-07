# DigitalOcean API
```javascript
var Api = require('digitalocean').Api;

var api = new Api('CLIENT_ID', 'API_KEY');
```

## Examples
```javascript
/*
This method returns all active droplets that are currently running in your account.
REST equivalent: GET /droplets
*/
api.droplets.all(function(list) {
	// get all droplets
	console.log(list);
});

/*
This method returns full information for a specific droplet ID
REST equivalent: GET /droplets/12345
*/
api.droplets.get(12345, function(droplet) {
	// get droplet #12345
	console.log(droplet);

	/* REST equivalent: GET /droplets/12345/destroy */
	droplet.destroy(function() {
		// destroyed
	});
});

/*
This method allows you to add a new public SSH key to your account.
REST equivalent: GET /ssh_keys/new
*/
api.ssh_keys.new(
	{
		name: "New SSH key"
		ssh_pub_key: "ssh-rsa ..................... user@host"
	},
	function(newSshKey) {
		console.log(newSshKey);
	}
);
```

## API
### Droplets
 - ``api.droplets.all([onSuccess])``
 - ``api.droplets.get(id, [onSuccess])``
 - ``api.droplets.new({new droplet fields}, [onSuccess])``
#### Droplet object
##### Properties
```javascript
{
	id: 100823,
	backups_active: null,
	image_id: 420,
	name: "test222",
	region_id: 1,
	size_id: 33,
	status: "active",
}
```
##### Methods
```javascript
reboot([onSuccess]);
power_cycle([onSuccess]);
shutdown([onSuccess]);
power_off([onSuccess]);
power_on([onSuccess]);
password_reset([onSuccess]);
resize({size_id: 1}, [onSuccess]);
snapshot({name: "Name"}, [onSuccess]);
restore({image_id: 1}, [onSuccess]);
rebuild({image_id: 1}, [onSuccess]);
enable_backups([onSuccess]);
disable_backups([onSuccess]);
rename({name: "New name"}, [onSuccess]);
destroy([onSuccess]);
```

Complete API documentation can be found at [https://www.digitalocean.com/api_access](https://www.digitalocean.com/api_access)

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
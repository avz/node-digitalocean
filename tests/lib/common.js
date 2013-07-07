exports.urlFingerprint = function(url) {
	return url.split(/[&\?]/g).sort().join('&');
};

exports.urlsIsEqual = function(url1, url2) {
	var fprint1 = exports.urlFingerprint(url1);
	var fprint2 = exports.urlFingerprint(url2);

	return fprint1 === fprint2;
};

exports.hashesIsEqual = function(o1, o2) {
	var count = 0;

	for(var k in o1) {
		if(o2[k] !== o1[k])
			return false;

		count++;
	}

	if(count !== Object.keys(o2).length)
		return false;

	return true;
};

exports.hasEqualProperties = function(object, needProps) {
	for(var p in needProps) {
		if(object[p] !== needProps[p])
			return false;
	}

	return true;
};

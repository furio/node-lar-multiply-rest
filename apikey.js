// Set in deploy
var KEYS = [];	// Api keys (STRING)

exports.isValidKey = function(theKey) {
	return KEYS.some(function(el) { return (el === theKey); });
};

exports.putKey = function(theKey) {
	KEYS.push(theKey);
};

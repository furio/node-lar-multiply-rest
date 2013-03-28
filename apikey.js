// Set in deploy
var KEYS = ["",	 // Testing key
			"",	 // weblar key
			""]; // prof key

exports.isValidKey = function(theKey) {
	return KEYS.some(function(el) { return (el === theKey); });
};
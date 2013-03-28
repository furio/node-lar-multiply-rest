// Set in deploy
var KEY = "";

exports.isValidKey = function(theKey) {
	return (theKey === KEY);
};
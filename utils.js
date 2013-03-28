exports.isUnsignedInteger = function(s) {
	if ((s === undefined) || ( s === null )) {
		return false;
	}
	return (s.toString().search(/^[0-9]+$/) == 0);
};
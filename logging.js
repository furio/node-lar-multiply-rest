var winston = require("winston");

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ level: 'info', colorize: true, timestamp: true }),
		new (winston.transports.File)({ level: 'silly', json: false, colorize: false, maxsize: 10 * 1000 * 1000, timestamp: true, filename: 'RESTMultiply.log' })
	]
});

exports.log = logger;
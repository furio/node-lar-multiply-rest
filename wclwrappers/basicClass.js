var WebCL = require('node-webcl');

var WCLPlatform =
exports.WCLPlatform = function() {
	if (!(this instanceof WCLPlatform)) {
		return new WCLPlatform();
	}

	Object.defineProperty(this, "platformId", {enumerable:true, writable: true});
	Object.defineProperty(this, "platformName", {enumerable:true, writable: true});
	Object.defineProperty(this, "platformDevices", {enumerable:true, writable: true});
	Object.defineProperty(this, "_platformPtr", {enumerable:false, writable: true});

	this.getPtrImplementation = function(){ return this._platformPtr; };
};

var WCLDevice =
exports.WCLDevice = function() {
	if (!(this instanceof WCLDevice)) {
		return new WCLDevice();
	}

	Object.defineProperty(this, "platform", {enumerable:false, writable: true});
	Object.defineProperty(this, "deviceId", {enumerable:true, writable: true});
	Object.defineProperty(this, "deviceName", {enumerable:true, writable: true});
	Object.defineProperty(this, "supportedOpenclVersion", {enumerable:true, writable: true});
	Object.defineProperty(this, "coreUnits", {enumerable:true, writable: true});
	Object.defineProperty(this, "globalMemory", {enumerable:true, writable: true});
	Object.defineProperty(this, "maximumWorkgroupSize", {enumerable:true, writable: true});
	Object.defineProperty(this, "maximumWorkitemSize", {enumerable:true, writable: true});
	Object.defineProperty(this, "isGpu", {enumerable:true, writable: true});
	Object.defineProperty(this, "_devicePtr", {enumerable:false, writable: true});

	this.getPtrImplementation = function(){ return this._devicePtr; };
};

var WCLWrapMemoryAccess =
exports.WCLWrapMemoryAccess = (function(){
	var oReturn = {};
	Object.defineProperty(oReturn, "READ_ONLY", {enumerable: true, value : WebCL.MEM_READ_ONLY});
	Object.defineProperty(oReturn, "WRITE_ONLY", {enumerable: true, value : WebCL.MEM_WRITE_ONLY});
	Object.defineProperty(oReturn, "READ_WRITE", {enumerable: true, value : WebCL.MEM_READ_WRITE});
	return oReturn;
})();
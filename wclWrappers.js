var WebCL = require('node-webcl'),
	fs = require('fs'),
	log = console.log;

if (WebCL === undefined) {
	throw new Error("Unfortunately your system does not support WebCL. Make sure that you have the WebCL extension installed.");
	return;
}

function WCLWrapContext() {
	this.currentPlatform = null;
	this.currentDevices = null;
	this.currentContext = null;
}

WCLWrapContext.prototype.getPlatforms = function() {
	return WebCL.getPlatforms();
}

WCLWrapContext.prototype.getCurrentPlatform = function() {
	return this.currentPlatform;
}

WCLWrapContext.prototype.getDevices = function() {
	return this.currentPlatform.getDevices(WebCL.DEVICE_TYPE_ALL);
}

WCLWrapContext.prototype.getCurrentDevices = function() {
	return this.currentDevices;
}

WCLWrapContext.prototype.getCurrentContext = function() {
	return this.currentContext;
}

WCLWrapContext.prototype.generateDefaultContext = function() {
	return this.currentContext;
}

WCLWrapContext.prototype.generateContext = function(platformId, deviceIds) {
	platformId = platformId || 0;
	deviceIds = deviceIds || [0];

	if ( this.currentContext != null ) {
		throw new Error("A conext is already in use. Release it before genereating a new one.");
	}


	if ((platformId < 0) || (platformId >= this.getPlatforms().length)) {
		throw new Error("Unknown platform id");
	}

	this.currentPlatform = this.getPlatforms()[platformId];

	var wclwrapObj = this;
	var usableDevices = [];

	deviceIds.forEach(function(el) {
		if ((el < 0) || (el >= wclwrapObj.getDevices().length)) {
			var currPlatform = wclwrapObj.getCurrentPlatform().getInfo(WebCL.PLATFORM_NAME);		
			wclwrapObj.currentPlatform = null;
			throw new Error("Unknown device id for platform: " + currPlatform);
		} else {
			usableDevices.push(wclwrapObj.getDevices()[el]);
		}
	});

	if (usableDevices.length <= 0) {
		var currPlatform = this.getCurrentPlatform().getInfo(WebCL.PLATFORM_NAME);		
		this.currentPlatform = null;
		throw new Error("Unknown device id for platform: " + currPlatform);
	}

	this.currentDevices = usableDevices;

	try {
		this.currentContext = WebCL.createContext({
    		deviceType: this.getCurrentDevices(),
    		platform: this.getCurrentPlatform()
  		});
	} catch (err) {
		var currPlatform = this.getCurrentPlatform().getInfo(WebCL.PLATFORM_NAME);

		this.currentPlatform = null;
		this.currentDevices = null;
		this.currentContext = null;

		throw new Error("Error while creating context for " + currentPlatform + ".\n"+err);
	}
}

WCLWrapContext.prototype.releaseContext = function() {
	this.currentContext = null;
}

function WCLWrapKernel(kernelName, contextWrapper) {
	if (!((typeof(kernelName) == "string") && (kernelName.length > 0))) {
		throw new Error("Need a kernel function name as input");
	}

	if (!(contextWrapper instanceof WCLWrapContext)) {
		throw new Error("Need a WCLWrapContext");
	}

	if (contextWrapper.getCurrentContext() == null) {
		throw new Error("Need a WCLWrapContext with a live context enabled");	
	}

	this.kernelName = kernelName;
	this.contextWrap = contextWrapper;
}

WCLWrapKernel.prototype.loadKernelFromFile = function(filePath) {
	this.kernelString = fs.readFileSync(filePath, 'ascii');
}

WCLWrapKernel.prototype.loadKernelFromString = function(kernelString) {
	this.kernelString = kernelString;
}

WCLWrapKernel.prototype.replaceKernelSourceVar = function(sourceVar, sourceContent) {
	this.kernelString = this.kernelString.replace(sourceVar, sourceContent);
}

WCLWrapKernel.prototype.createClKernel = function(argObjList) {
	var kernelOut = null, program = null;
	argObjList = argObjList || [];

	if (this.kernelString == null) {
		throw new Error("Cannot build a kernel on an empty source");
	}

	try {
		program = this.contextWrap.getCurrentContext().createProgram(this.kernelString);
	} catch(err) {
		program = null;
		throw new Error("Problem while building kernel.");
	}

	try {
		program.build(this.contextWrap.getCurrentDevices());
		kernelOut = program.createKernel(this.kernelName);
	} catch(err) {
		kernelOut = null;
		throw new Error("Problem while building and creating kernel.\n" + program.getBuildInfo(currDevice,WebCL.PROGRAM_BUILD_LOG));
	}

	if (argObjList.length > 0) {
		argObjList.forEach(function(el,idx) {
			kernelOut.setArg(idx, el);
		});
	}
	
	return kernelOut;
}
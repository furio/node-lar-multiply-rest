/* jshint bitwise: false */

var WebCL = require('node-webcl'),
	fs = require('fs'),
	log = require("./logging.js").log;

// ***************** //

var dynamicSortMultiple = function() {
	var dynamicSort = function(property) {
		return function (obj1,obj2) {
			return obj1[property] > obj2[property] ? 1 : obj1[property] < obj2[property] ? -1 : 0;
		};
	};
	/*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
	var props = arguments;
	return function (obj1, obj2) {
		var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
		while(result === 0 && i < numberOfProperties) {
			result = dynamicSort(props[i])(obj1, obj2);
			i++;
		}
		return result;
	};
};

// ***************** //

/// TODO: Better abstraction => WebCLPlatform (new object representing a platform) should have fetchAllDevices
///	so that WebCLDevice has only member platform pointing to his WebCLPlatform owner. Possibly

var WebCLDevice = function() {
	if (!(this instanceof WebCLDevice)) {
		return new WebCLDevice();
	}

	Object.defineProperty(this, "platformId", {writable: true});
	Object.defineProperty(this, "platformName", {writable: true});
	Object.defineProperty(this, "deviceId", {writable: true});
	Object.defineProperty(this, "deviceName", {writable: true});
	Object.defineProperty(this, "supportedOpenclVersion", {writable: true});
	Object.defineProperty(this, "coreUnits", {writable: true});
	Object.defineProperty(this, "globalMemory", {writable: true});
	Object.defineProperty(this, "maximumWorkgroupSize", {writable: true});
	Object.defineProperty(this, "maximumWorkitemSize", {writable: true});
	Object.defineProperty(this, "isGpu", {writable: true});
};

// ***************** //

var DeviceSelector = {};
DeviceSelector.fetchAllPlatforms = function() {
	return WebCL.getPlatforms();
};

DeviceSelector.fetchAllDevices = function() {
	var allPlatforms = this.fetchAllPlatforms();
	var possiblePlatforms = new Array(allPlatforms.length);

	allPlatforms.forEach(function(currPlatform, i) {
		possiblePlatforms[i] = [];
		var platformName = currPlatform.getInfo(WebCL.PLATFORM_NAME);
		var platformDevices = currPlatform.getDevices(WebCL.DEVICE_TYPE_ALL);

		if (platformDevices.length !== 0) {
			platformDevices.forEach(function(currDevice, j) {
				var currDevicetype = parseInt( currDevice.getInfo(WebCL.DEVICE_TYPE), 10 );
				var newDevice = new WebCLDevice();

				newDevice.platformId = i;
				newDevice.platformName = platformName;
				newDevice.deviceId = j;
				newDevice.deviceName = currDevice.getInfo(WebCL.DEVICE_NAME);
				newDevice.supportedOpenclVersion = currDevice.getInfo(WebCL.DEVICE_OPENCL_C_VERSION);
				newDevice.coreUnits = currDevice.getInfo(WebCL.DEVICE_MAX_COMPUTE_UNITS);
				newDevice.globalMemory = currDevice.getInfo(WebCL.DEVICE_GLOBAL_MEM_SIZE);
				newDevice.maximumWorkgroupSize = currDevice.getInfo(WebCL.DEVICE_MAX_WORK_GROUP_SIZE);
				newDevice.maximumWorkitemSize = currDevice.getInfo(WebCL.DEVICE_MAX_WORK_ITEM_DIMENSIONS);
				newDevice.isGpu = ( currDevicetype & WebCL.DEVICE_TYPE_GPU );

				possiblePlatforms[i].push( newDevice );
			});
		}
	});

	return possiblePlatforms;
};

DeviceSelector.fetchGraphicDevices = function() {
	var possiblePlatforms = this.fetchAllDevices();
	var filteredPlatform = new Array(possiblePlatforms.length);

	possiblePlatforms.forEach(function(currPlatform, i) {
		filteredPlatform[i] = currPlatform.filter(function(device) {
			return (device.isGpu === true);
		});
	});

	return filteredPlatform;
};

DeviceSelector.fetchGraphicDevicesWithMoreWorkDimension = function() {
	var possiblePlatforms = this.fetchGraphicDevices();
	var filteredPlatform = new Array(possiblePlatforms.length);

	possiblePlatforms.forEach(function(currPlatform, i) {
		filteredPlatform[i] = currPlatform.filter(function(device) {
			return (device.maximumWorkitemSize > 1);
		});
	});

	return filteredPlatform;
};

DeviceSelector.selectBestGraphicDevice = function() {
	var possiblePlatforms = this.fetchGraphicDevicesWithMoreWorkDimension();

	if ( !possiblePlatforms.some(function(el) { return (el.length > 0); }) ) {
		throw new Error("Not enough devices.");
	}

	possiblePlatforms.forEach(function(el) { el.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") ); });

	var bestDevicePlatform = [];
	possiblePlatforms.forEach(function(el) { if(el.length > 0) { bestDevicePlatform.push(el[0]); } });
	bestDevicePlatform.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );

	return bestDevicePlatform.splice(0,1);
};

DeviceSelector.selectBestGraphicPlatform = function() {
	var possiblePlatforms = this.fetchGraphicDevicesWithMoreWorkDimension();

	if ( !possiblePlatforms.some(function(el) { return (el.length > 0); }) ) {
		throw new Error("Not enough devices.");
	}

	possiblePlatforms.forEach(function(el) { el.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") ); });

	var platformSummary = new Array(possiblePlatforms.length);

	possiblePlatforms.forEach(function(currPlatform, i) {
		// Create a fake device that is the weighted sum of all devices for that platform
		var summaryDevice = new WebCLDevice();

		summaryDevice.platformId = -1;
		summaryDevice.coreUnits = 0;
		summaryDevice.globalMemory = 0;
		summaryDevice.maximumWorkgroupSize = 0;

		currPlatform.forEach(function(currDevice) {
			summaryDevice.platformId = currDevice.platformId;
			summaryDevice.coreUnits += currDevice.coreUnits;
			summaryDevice.globalMemory += currDevice.globalMemory;
			summaryDevice.maximumWorkgroupSize += currDevice.maximumWorkgroupSize;
		});

		summaryDevice.coreUnits /= currPlatform.length;
		summaryDevice.globalMemory /= currPlatform.length;
		summaryDevice.maximumWorkgroupSize /= currPlatform.length;
		platformSummary[i] = summaryDevice;
	});

	platformSummary.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );

	return possiblePlatforms[platformSummary[0].platformId];
};

// ***************** //

var WCLWrapMemoryAccess = (function(){
	var oReturn = {};
	Object.defineProperty(oReturn, "READ_ONLY", {enumerable: true, value : WebCL.MEM_READ_ONLY});
	Object.defineProperty(oReturn, "WRITE_ONLY", {enumerable: true, value : WebCL.MEM_WRITE_ONLY});
	Object.defineProperty(oReturn, "READ_WRITE", {enumerable: true, value : WebCL.MEM_READ_WRITE});
	return oReturn;
})();

// ***************** //

function WCLWrapContext() {
	// Platform, Devices, Context
	var m_currentPlatform = null;
	var m_currentDevices = null;
	var m_currentContext = null;

	this.getCurrentPlatform = function() {
		return m_currentPlatform;
	};

	this.getCurrentDevices = function() {
		return m_currentDevices;
	};

	this.getCurrentContext = function() {
		return m_currentContext;
	};

	// Buffers
	var m_buffersObject = {};
	var mf_getBufferName = function(bufferName) {
		var m_prependBufferName = "BUF_";
		return m_prependBufferName+bufferName;
	};

	this.createBuffer = function(name, length, destTypeLength, destAccess) {
		var bufName = mf_getBufferName(name);

		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( m_buffersObject.hasOwnProperty(bufName) ) {
			throw new Error("A buffer already exist with this name");
		}

		if (!( (destAccess !== WCLWrapMemoryAccess.READ_ONLY) ||
				(destAccess !== WCLWrapMemoryAccess.WRITE_ONLY) ||
				(destAccess !== WCLWrapMemoryAccess.READ_WRITE) )) {

			throw new Error("Unknown access type");
		}

		var returnedBuffer = null;

		try {
			returnedBuffer = this.getCurrentContext().createBuffer(destAccess, length * destTypeLength);
		} catch(err) {
			returnedBuffer = null;
		}

		if ( returnedBuffer !== null ) {
			m_buffersObject[bufName] = {"inuse": 0, "buffer": returnedBuffer};
		}

		return ( returnedBuffer !== null );
	};

	this.deleteBuffer = function(name) {
		var bufName = mf_getBufferName(name);

		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( !m_buffersObject.hasOwnProperty(bufName) ) {
			return true;
		}

		if ( m_buffersObject[bufName].inuse !== 0 ) {
			return false;
		}

		m_buffersObject[bufName].buffer.release();
		delete m_buffersObject[bufName];

		return true;
	};

	this.getBuffer = function(name) {
		var bufName = mf_getBufferName(name);

		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( !m_buffersObject.hasOwnProperty(bufName) ) {
			throw new Error("No such buffer exist.");
		}

		m_buffersObject[bufName].inuse += 1;
		return m_buffersObject[bufName].buffer;
	};

	this.giveBuffer = function(name) {
		var bufName = mf_getBufferName(name);

		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( !m_buffersObject.hasOwnProperty(bufName) ) {
			throw new Error("No such buffer exist.");
		}

		m_buffersObject[bufName].inuse -= 1;
	};

	// * //

	this.generateContext = function(platformId, deviceIds) {
		platformId = platformId || 0;
		deviceIds = deviceIds || [0];

		if ( this.getCurrentContext() !== null ) {
			throw new Error("A context is already in use. Release it before genereating a new one.");
		}

		if ((platformId < 0) || (platformId >= DeviceSelector.fetchAllPlatforms().length)) {
			throw new Error("Unknown platform id");
		}

		m_currentPlatform = DeviceSelector.fetchAllPlatforms()[platformId];

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
			m_currentPlatform = null;
			throw new Error("Unknown device id for platform: " + currPlatform);
		}

		m_currentDevices = usableDevices;

		try {
			m_currentContext = WebCL.createContext({
				devices: this.getCurrentDevices(),
				platform: this.getCurrentPlatform()
			});
		} catch (err) {
			var currPlatform = this.getCurrentPlatform().getInfo(WebCL.PLATFORM_NAME);

			m_currentPlatform = null;
			m_currentDevices = null;
			m_currentContext = null;

			throw new Error("Error while creating context for " + currPlatform + ".\n"+err);
		}
	};

	this.releaseContext = function() {
		if ( this.getCurrentContext() !== null ) {
			this.getCurrentContext().release();
			m_currentContext = null;
		}
	};
}


WCLWrapContext.prototype.generateBestGraphicContext = function(multipleDevices) {
	multipleDevices = multipleDevices || false;

	// No if we already have an instance
	if ( this.getCurrentContext() !== null ) {
		throw new Error("A context is already in use. Release it before genereating a new one.");
	}

	var usableDevices = null;

	try {
		usableDevices = (multipleDevices === true) ?
								DeviceSelector.selectBestGraphicPlatform()
							:
								DeviceSelector.selectBestGraphicDevice();
	} catch (err) {
		throw Error("Error while selecting devices/platforms: " + err.toString());
	}


	// By specification we can have only a context on a platform and not across platforms
	var platformId = usableDevices[0].platformId;

	// Fetch the devices id (should be only one if multipleDevices is false)
	var deviceIds = [];
	usableDevices.forEach(function(el) { deviceIds.push( el.deviceIds ); });

	// Generate context
	this.generateContext(platformId, deviceIds);
};

// ********************** //


function WCLWrapKernel(kernelName, contextWrapper) {
	if (!((typeof(kernelName) == "string") && (kernelName.length > 0))) {
		throw new Error("Need a kernel function name as input");
	}

	if (!(contextWrapper instanceof WCLWrapContext)) {
		throw new Error("Need a WCLWrapContext");
	}

	if (contextWrapper.getCurrentContext() === null) {
		throw new Error("Need a WCLWrapContext with a live context enabled");
	}

	var m_kernelName = kernelName;
	var m_contextWrap = contextWrapper;
	var m_kernelContent = null;
	var m_kernelReplaces = {};
	var m_kernelDefines = {};

	this.getKernelName = function() {
		return m_kernelName;
	};

	this.getContextWrap = function() {
		return m_contextWrap;
	};

	this.getReplaceMap = function() {
		return m_kernelReplaces;
	};

	this.getDefinesMap = function() {
		return m_kernelDefines;
	};

	this.loadKernelFromFile = function(filePath) {
		m_kernelContent = fs.readFileSync(filePath, 'ascii');
	};

	this.loadKernelFromString = function(kernelString) {
		m_kernelContent = kernelString;
	};

	this.addKernelReplace = function(key,value) {
		if ( m_kernelReplaces.hasOwnProperty(key) ) {
			log.silly("key already exist in m_kernelReplaces");
		}
		m_kernelReplaces[key] = value;
	};

	this.addKernelDefine = function(key,value) {
		if ( m_kernelDefines.hasOwnProperty(key) ) {
			log.silly("key already exist in m_kernelDefines");
		}
		m_kernelDefines[key] = value;
	};

	this.describeKernelVars = function(position, buffNameOrlocalSize) {

	};
}


WCLWrapKernel.prototype.createClKernel = function(argObjList) {
	var kernelOut = null, program = null;
	argObjList = argObjList || [];

	if (this.kernelString === null) {
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
		throw new Error("Problem while building and creating kernel.\n");
	}

	if (argObjList.length > 0) {
		argObjList.forEach(function(el,idx) {
			kernelOut.setArg(idx, el);
		});
	}

	return kernelOut;
};

// ************************** //

exports.WCLWrapMemoryAccess = WCLWrapMemoryAccess;
exports.WCLWrapContext = WCLWrapContext;
exports.WCLWrapKernel = WCLWrapKernel;
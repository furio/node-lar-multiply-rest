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

var WCLPlatform = function() {
	if (!(this instanceof WCLPlatform)) {
		return new WCLPlatform();
	}

	Object.defineProperty(this, "platformId", {enumerable:true, writable: true});
	Object.defineProperty(this, "platformName", {enumerable:true, writable: true});
	Object.defineProperty(this, "platformDevices", {enumerable:true, writable: true});
	Object.defineProperty(this, "_platformPtr", {enumerable:false, writable: true});

	this.getPtrImplementation = function(){ return this._platformPtr; };
};

var WCLDevice = function() {
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

// ***************** //

var DeviceSelector = {};

DeviceSelector._fetchAllPlatformsCL = function() {
	return WebCL.getPlatforms();
};

DeviceSelector._fetchPlatformDevices = function(platformObj) {
	if (!(platformObj instanceof WCLPlatform)) {
		throw new Error("It must be an instance of WebCLPlatform");
	}

	var platformDevices = platformObj.getPtrImplementation().getDevices(WebCL.DEVICE_TYPE_ALL);
	var possibleDevices = new Array(platformDevices.length);

	if ( platformDevices.length === 0 ) {
		return possibleDevices;
	}

	platformDevices.forEach(function(currDevice, i) {
		var currDevicetype = parseInt( currDevice.getInfo(WebCL.DEVICE_TYPE), 10 );
		var newDevice = new WCLDevice();

		newDevice.platform = platformObj;
		newDevice.deviceId = i;
		newDevice.deviceName = currDevice.getInfo(WebCL.DEVICE_NAME).trim();
		newDevice.supportedOpenclVersion = currDevice.getInfo(WebCL.DEVICE_OPENCL_C_VERSION).trim();
		newDevice.coreUnits = currDevice.getInfo(WebCL.DEVICE_MAX_COMPUTE_UNITS);
		newDevice.globalMemory = currDevice.getInfo(WebCL.DEVICE_GLOBAL_MEM_SIZE);
		newDevice.maximumWorkgroupSize = currDevice.getInfo(WebCL.DEVICE_MAX_WORK_GROUP_SIZE);
		newDevice.maximumWorkitemSize = currDevice.getInfo(WebCL.DEVICE_MAX_WORK_ITEM_DIMENSIONS);
		newDevice.isGpu = (( currDevicetype & WebCL.DEVICE_TYPE_GPU ) > 0);
		newDevice._devicePtr = currDevice;

		possibleDevices[i] = newDevice;
	});

	return possibleDevices;
};

DeviceSelector.fetchAllPlatforms = function() {
	var clPlatform = this._fetchAllPlatformsCL();
	var possiblePlatforms = new Array(clPlatform.length);

	clPlatform.forEach(function(currPlatform, i) {
		var newPlatform = new WCLPlatform();

		newPlatform.platformId = i;
		newPlatform.platformName = currPlatform.getInfo(WebCL.PLATFORM_NAME).trim();
		newPlatform._platformPtr = currPlatform;
		newPlatform.platformDevices = DeviceSelector._fetchPlatformDevices(newPlatform);

		possiblePlatforms[i] = newPlatform;
	});

	return possiblePlatforms;
};

DeviceSelector.fetchAllDevices = function() {
	return this.fetchAllPlatforms();
};

DeviceSelector.fetchGraphicDevices = function() {
	var possiblePlatforms = this.fetchAllDevices();

	var returnPlatforms = possiblePlatforms.filter(function(currPlatform) {
		currPlatform.platformDevices = currPlatform.platformDevices.filter(function(currDevice) {
			return (currDevice.isGpu === true);
		});

		return (currPlatform.platformDevices.length !== 0);
	});

	return returnPlatforms;
};

DeviceSelector.fetchGraphicDevicesWithMoreWorkDimension = function() {
	var possiblePlatforms = this.fetchGraphicDevices();

	var returnPlatforms = possiblePlatforms.filter(function(currPlatform) {
		currPlatform.platformDevices = currPlatform.platformDevices.filter(function(currDevice) {
			return (currDevice.maximumWorkitemSize > 1);
		});

		return (currPlatform.platformDevices.length !== 0);
	});

	return returnPlatforms;
};

DeviceSelector.selectBestGraphicDevice = function() {
	var possiblePlatforms = this.fetchGraphicDevicesWithMoreWorkDimension();

	if ( !possiblePlatforms.some(function(el) { return (el.platformDevices.length > 0); }) ) {
		throw new Error("Not enough devices.");
	}

	possiblePlatforms.forEach(function(el) {
		el.platformDevices.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );
	});

	var bestDevicePlatform = [];
	possiblePlatforms.forEach(function(el) {
		if(el.platformDevices.length > 0) {
			bestDevicePlatform.push(el.platformDevices[0]);
		}
	});
	bestDevicePlatform.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );

	return bestDevicePlatform.splice(0,1);
};

DeviceSelector.selectBestGraphicPlatform = function() {
	var possiblePlatforms = this.fetchGraphicDevicesWithMoreWorkDimension();

	if ( !possiblePlatforms.some(function(el) { return (el.platformDevices.length > 0); }) ) {
		throw new Error("Not enough devices.");
	}

	possiblePlatforms.forEach(function(el) {
		el.platformDevices.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );
	});

	var platformSummary = [];

	possiblePlatforms.forEach(function(currPlatform) {
		// Create a fake device that is the weighted sum of all devices for that platform
		var totalDevices = currPlatform.platformDevices.length;
		var summaryDevice = new WCLDevice();

		summaryDevice.platformId = -1;
		summaryDevice.coreUnits = 0;
		summaryDevice.globalMemory = 0;
		summaryDevice.maximumWorkgroupSize = 0;

		currPlatform.platformDevices.forEach(function(currDevice) {
			summaryDevice.platform = currDevice.platform;
			summaryDevice.coreUnits += currDevice.coreUnits;
			summaryDevice.globalMemory += currDevice.globalMemory;
			summaryDevice.maximumWorkgroupSize += currDevice.maximumWorkgroupSize;
		});

		summaryDevice.coreUnits /= totalDevices;
		summaryDevice.globalMemory /= totalDevices;
		summaryDevice.maximumWorkgroupSize /= totalDevices;
		platformSummary.push(summaryDevice);
	});

	platformSummary.sort( dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );

	return platformSummary[0].platform.platformDevices;
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

	this.generateContext = function(platformObject, deviceLists) {
		if ( this.getCurrentContext() !== null ) {
			throw new Error("A context is already in use. Release it before genereating a new one.");
		}

		if (!(platformObject instanceof WCLPlatform)) {
			throw new Error("platformObject must be an instance of WCLPlatform");
		}

		if ( Object.prototype.toString.call( deviceLists ) !== '[object Array]' ) {
			throw new Error("deviceLists must be an array of WCLDevice");
		}

		if ( ( deviceLists.length === 0) || ( deviceLists.every(function(el){ return (el instanceof WCLDevice); }) ) ) {
			throw new Error("deviceLists must be an array of WebCLDevice and longer than 0");
		}

		m_currentPlatform = platformObject.getPtrImplementation();

		var wclwrapObj = this;
		var usableDevices = [];

		deviceLists.forEach(function(el) {
			usableDevices.push(el.getPtrImplementation());
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

	if (usableDevices.length === 0) {
		throw Error("Error while selecting devices/platforms: nothing found");
	}

	// By specification we can have only a context on a platform and not across platforms
	var platformObj = usableDevices[0].platform;

	// Generate context
	this.generateContext(platformObj, usableDevices);
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
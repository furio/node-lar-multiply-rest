var WebCL = require('node-webcl'),
	basicClasses = require("./basicClass"),
	deviceSelector = require("./deviceSelector"),
	log = require("./logging.js").log;

var WCLWrapContext =
exports.WCLWrapContext = function() {
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

	this.existBuffer = function(bufName) {
		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		return m_buffersObject.hasOwnProperty(bufName);
	};

	this.createBuffer = function(bufName, length, destTypeLength, destAccess) {
		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( this.existBuffer(bufName) ) {
			throw new Error("A buffer already exist with this name");
		}

		if (!( (destAccess !== basicClasses.WCLWrapMemoryAccess.READ_ONLY) ||
				(destAccess !== basicClasses.WCLWrapMemoryAccess.WRITE_ONLY) ||
				(destAccess !== basicClasses.WCLWrapMemoryAccess.READ_WRITE) )) {

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

	this.deleteBuffer = function(bufName) {
		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( !this.existBuffer(bufName) ) {
			return true;
		}

		if ( m_buffersObject[bufName].inuse !== 0 ) {
			return false;
		}

		m_buffersObject[bufName].buffer.release();
		delete m_buffersObject[bufName];

		return true;
	};

	this.getBuffer = function(bufName) {
		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( !this.existBuffer(bufName) ) {
			throw new Error("No such buffer exist.");
		}

		m_buffersObject[bufName].inuse += 1;
		return m_buffersObject[bufName].buffer;
	};

	this.giveBuffer = function(bufName) {
		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		if ( !this.existBuffer(bufName) ) {
			throw new Error("No such buffer exist.");
		}

		if ( m_buffersObject[bufName].inuse === 0 ) {
			return false;
		}

		m_buffersObject[bufName].inuse -= 1;
		return true;
	};

	this.flushBuffers = function(force) {
		force = force || false;

		if ( this.getCurrentContext() === null ) {
			throw new Error("No context has been initialized.");
		}

		for (var key in m_buffersObject) {
			if (this.deleteBuffer(key) !== true && force === true) {
				while( !this.giveBuffer(key) ) {}
				this.deleteBuffer(key);
			}
		}
	};

	// * //

	this.generateContext = function(platformObject, deviceLists) {
		if ( this.getCurrentContext() !== null ) {
			throw new Error("A context is already in use. Release it before genereating a new one.");
		}

		if (!(platformObject instanceof basicClasses.WCLPlatform)) {
			throw new Error("platformObject must be an instance of WCLPlatform");
		}

		if ( Object.prototype.toString.call( deviceLists ) !== '[object Array]' ) {
			throw new Error("deviceLists must be an array of WCLDevice");
		}

		if ( ( deviceLists.length === 0) || ( deviceLists.every(function(el){ return (el instanceof basicClasses.WCLDevice); }) ) ) {
			throw new Error("deviceLists must be an array of WebCLDevice and longer than 0");
		}

		m_currentPlatform = platformObject.getPtrImplementation();

		var wclwrapObj = this;
		var usableDevices = [];

		deviceLists.forEach(function(el) {
			usableDevices.push(el.getPtrImplementation());
		});

		if (usableDevices.length <= 0) {
			m_currentPlatform = null;
			throw new Error("Unknown device id for platform: " + platformObject.platformName);
		}

		m_currentDevices = usableDevices;

		try {
			m_currentContext = WebCL.createContext({
				devices: this.getCurrentDevices(),
				platform: this.getCurrentPlatform()
			});
		} catch (err) {
			m_currentPlatform = null;
			m_currentDevices = null;
			m_currentContext = null;

			throw new Error("Error while creating context for " + platformObject.platformName + ".\n"+err);
		}
	};

	this.releaseContext = function(force) {
		if ( this.getCurrentContext() !== null ) {
			this.flushBuffers(force);
			this.getCurrentContext().release();
			m_currentContext = null;
		}
	};
};


WCLWrapContext.prototype.generateBestGraphicContext = function(multipleDevices) {
	multipleDevices = multipleDevices || false;

	// No if we already have an instance
	if ( this.getCurrentContext() !== null ) {
		throw new Error("A context is already in use. Release it before genereating a new one.");
	}

	var usableDevices = null;

	try {
		usableDevices = (multipleDevices === true) ?
								deviceSelector.DeviceSelector.selectBestGraphicPlatform()
							:
								deviceSelector.DeviceSelector.selectBestGraphicDevice();
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

var WCLWrapKernel =
exports.WCLWrapKernel = function (kernelName, contextWrapper) {
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
	var m_kernelArguments = [];
	var m_kernelImpl = {
		"program" : null,
		"kernel" : null
	};

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
		m_kernelContent = basicClasses.FileReader.readFileAscii(filePath);
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

	this.describeKernelArgs = function(position, buffName) {
		if ( isNaN(position) || (position < 0) ) {
			throw new Error("Wrong positional index");
		}

		if ( m_contextWrap.existBuffer(buffName) ) {
			throw new Error("No such buffer name");
		}

		if ( m_kernelArguments[position] !== null ) {
			throw new Error("Position already in use!");
		}

		m_kernelArguments[position] = buffName;
	};

	this.describeKernelLocalArgs = function(position, localSize) {
		throw new Error("Not implemented");
	};	
};

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
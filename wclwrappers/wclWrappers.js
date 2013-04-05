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

	var mf_isValidIstance = function() {
		if ( m_currentContext === null ) {
			throw new Error("No context has been initialized.");
		}
	};

	// Buffers
	var m_buffersObject = {};

	this.existBuffer = function(bufName) {
		mf_isValidIstance();

		return m_buffersObject.hasOwnProperty(bufName);
	};

	var mf_createBuffer = function(bufName, length, destTypeLength, destAccess) {
		mf_isValidIstance();

		if ( this.existBuffer(bufName) ) {
			throw new Error("A buffer already exist with this name");
		}

//		if (!( (destAccess !== basicClasses.WCLWrapMemoryAccess.READ_ONLY) ||
//				(destAccess !== basicClasses.WCLWrapMemoryAccess.WRITE_ONLY) ||
//				(destAccess !== basicClasses.WCLWrapMemoryAccess.READ_WRITE) )) {
//
//			throw new Error("Unknown access type");
//		}

		var returnedBuffer = null;

		try {
			returnedBuffer = m_currentContext.createBuffer(destAccess, length * destTypeLength);
		} catch(err) {
			returnedBuffer = null;
		}

		if ( returnedBuffer !== null ) {
			m_buffersObject[bufName] = {"inuse": 0, "buffer": returnedBuffer};
		}

		return ( returnedBuffer !== null );
	};

	this.createReadOnlyBuffer = function(bufName, length, destTypeLength) {
		return mf_createBuffer(bufName, length, destTypeLength, basicClasses.WCLWrapMemoryAccess.READ_ONLY);
	};

	this.createWriteOnlyBuffer = function(bufName, length, destTypeLength) {
		return mf_createBuffer(bufName, length, destTypeLength, basicClasses.WCLWrapMemoryAccess.WRITE_ONLY);
	};

	this.createReadWriteBuffer = function(bufName, length, destTypeLength) {
		return mf_createBuffer(bufName, length, destTypeLength, basicClasses.WCLWrapMemoryAccess.READ_WRITE);
	};

	this.deleteBuffer = function(bufName) {
		mf_isValidIstance();

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
		mf_isValidIstance();

		if ( !this.existBuffer(bufName) ) {
			throw new Error("No such buffer exist.");
		}

		m_buffersObject[bufName].inuse += 1;
		return m_buffersObject[bufName].buffer;
	};

	this.giveBuffer = function(bufName) {
		mf_isValidIstance();

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

		mf_isValidIstance();

		for (var key in m_buffersObject) {
			if (this.deleteBuffer(key) !== true && force === true) {
				while( !this.giveBuffer(key) ) {}
				this.deleteBuffer(key);
			}
		}
	};

	// * //

	var mf_generateContext = function(platformObject, deviceLists) {
		// Nope! the opposite !== null
		// mf_isValidIstance();

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
		if ( m_currentContext !== null ) {
			this.flushBuffers(force);
			m_currentContext.release();
			m_currentContext = null;
		}
	};

	this.generateBestGraphicContext = function(multipleDevices) {
		multipleDevices = multipleDevices || false;

		// No if we already have an instance
		if ( m_currentContext !== null ) {
			throw new Error("No context has been initialized.");
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
		mf_generateContext(platformObj, usableDevices);
	};

	this.buildProgram = function(source) {
		mf_isValidIstance();

		return new WCLWrapProgram(m_currentContext.createProgram(source));
	};
};

// ********************** //

var WCLWrapProgram =
exports.WCLWrapProgram = function (programPtr) {
	var m_programPtr = programPtr;

	var mf_buildReady = function() {
		if ( m_programPtr === null ) {
			throw new Error("Build is not ready");
		}
	};

	this.build = function(contextWrapper, defines) {
		mf_buildReady();

		try {
			m_programPtr.build(contextWrapper.getCurrentDevices(), defines);
		} catch(err) {
			this.release();
			throw new Error(err);
		}
	};

	this.kernelImpl = function(name) {
		mf_buildReady();

		var kernelImpl = null;

		try {
			kernelImpl = m_programPtr.createKernel(name);
		} catch(err) {
			kernelImpl = null;
		}

		return kernelImpl;
	};

	this.release = function() {
		if ( m_programPtr !== null ) {
			m_programPtr.release();
			m_programPtr = null;
		}
	};
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

	var m_kernelName = kernelName;
	var m_contextWrap = contextWrapper;
	//
	var m_kernelContent = null;
	var m_kernelReplaces = {};
	var m_kernelDefines = {};
	var m_kernelArguments = [];
	//
	var m_programWrap = null;
	var m_kernelImpl = null;

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

	var mf_doKernelReplace = function() {
		var replacedString = m_kernelContent;
		for(var key in m_kernelReplaces) {
			replacedString.replace(key, m_kernelReplaces[key]);
		}
		return replacedString;
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

	var mf_prepareProgram = function(kernelString, definesMap) {
		var programInstance = null;

		try {
			programInstance = this.getContextWrap().buildProgram(kernelString);
			programInstance.build(this.getContextWrap(), definesMap);
		} catch(err) {
			programInstance = null;
		}

		return programInstance;
	};

	this.setupKernel = function() {
		if (m_kernelContent === null) {
			throw new Error("Cannot build a kernel on an empty source");
		}

		// The replace for defines
		var replacedKernel = mf_doKernelReplace();
		var definesMap = "";
		var programReturn = mf_prepareProgram(replacedKernel, definesMap);

		if ( programReturn === null ) {
			throw new Error("Cannot setup a WCLProgram");
		}

		// kernel = program.createKernel("kernel_name");

		/*
		if (argObjList.length > 0) {
			argObjList.forEach(function(el,idx) {
				kernelOut.setArg(idx, el);
			});
		}

		m_programWrap = programReturn;
		*/
	};
};

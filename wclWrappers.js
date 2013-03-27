var WebCL = require('node-webcl'),
	fs = require('fs'),
	log = console.log;

// ***************** //

var dynamicSortMultiple = function() {
	var dynamicSort = function(property) { 
	    return function (obj1,obj2) {
	        return obj1[property] > obj2[property] ? 1
	            : obj1[property] < obj2[property] ? -1 : 0;
	    }
	}
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
	}
};

var getWebCLPlatforms = function() {
	return WebCL.getPlatforms();
};

var contextSelector = function(multipleDevices) {
	multipleDevices = multipleDevices || false;

	// All platforms
	var platforms = getWebCLPlatforms();
	var possiblePlatforms = new Array(platforms.length);

	// For each platform
	platforms.forEach(function(currP, i) {
  		possiblePlatforms[i] = new Array();
  		var devices = currP.getDevices(WebCL.DEVICE_TYPE_ALL);
	  		
  		if (devices.length != 0) {
	  		devices.forEach(function(currD, j) {
	  			var currD = devices[j];
	  			var currDtype = parseInt( currD.getInfo(WebCL.DEVICE_TYPE) );

	  			// We need a GPU with at least 2 dimensions workgroups
	  			if ( ( currDtype & WebCL.DEVICE_TYPE_GPU ) &&
	  				 ( currD.getInfo(WebCL.DEVICE_MAX_WORK_ITEM_DIMENSIONS) >= 2 ) ) {

		  			possiblePlatforms[i].push( {
		  				"pid": i,
		  				"did": j,
						"pname": currP.getInfo(WebCL.PLATFORM_NAME),
		  				"dname": currD.getInfo(WebCL.DEVICE_NAME),
		  				// "opencl": currD.getInfo(WebCL.DEVICE_OPENCL_C_VERSION),
		  				"units": currD.getInfo(WebCL.DEVICE_MAX_COMPUTE_UNITS),
		  				"gmem": currD.getInfo(WebCL.DEVICE_GLOBAL_MEM_SIZE),
		  				"group": currD.getInfo(WebCL.DEVICE_MAX_WORK_GROUP_SIZE)
		  			} );  				
	  			}
	  		});  			
  		}
  	});

  	if ( !possiblePlatforms.some(function(el) { return (el.length > 0); }) ) {
  		throw new Error("Not enough devices.");
  	}

  	possiblePlatforms.forEach(function(el) { el.sort( dynamicSortMultiple("units","mem","group") ); });

  	if ( multipleDevices === true ) {
  		var platformSummary = new Array(possiblePlatforms.length);

		possiblePlatforms.forEach(function(el,idx) {
			platformSummary[idx] = { "pid": -1, "units": 0, "gmem": 0, "group": 0 };

			el.forEach(function(insideEl) {
				platformSummary[idx].pid = insideEl.pid;
				platformSummary[idx].units += insideEl.units;
				platformSummary[idx].gmem += insideEl.gmem;
				platformSummary[idx].group += insideEl.group;
			});
				
			platformSummary[idx].units /= el.length;
			platformSummary[idx].gmem /= el.length;
			platformSummary[idx].group /= el.length;
		});

		platformSummary.sort( dynamicSortMultiple("units","mem","group") );

		return possiblePlatforms[platformSummary[0].pid];
	} else {
		var bestDevicePlatform = [];
		possiblePlatforms.forEach(function(el) { if(el.length > 0) { bestDevicePlatform.push(el[0]); } });
		bestDevicePlatform.sort( dynamicSortMultiple("units","mem","group") );
		return bestDevicePlatform.splice(0,1);
	}
};

// ***************** //

function WCLWrapContext() {
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

	this.generateContext = function(platformId, deviceIds) {
		platformId = platformId || 0;
		deviceIds = deviceIds || [0];

		if ( this.getCurrentContext() !== null ) {
			throw new Error("A context is already in use. Release it before genereating a new one.");
		}

		if ((platformId < 0) || (platformId >= getWebCLPlatforms().length)) {
			throw new Error("Unknown platform id");
		}

		m_currentPlatform = getWebCLPlatforms()[platformId];

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

			throw new Error("Error while creating context for " + currentPlatform + ".\n"+err);
		}
	};

	this.releaseContext = function() {
		if ( this.getCurrentContext() !== null ) {
			this.getCurrentContext().release();
			m_currentContext = null;		
		}
	};	
}

WCLWrapContext.prototype.getCurrentPlatformDevices = function() {
	if (this.getCurrentPlatform() === null) {
		throw new Error("You need a platform to select devices.");
	}

	return this.getCurrentPlatform().getDevices(WebCL.DEVICE_TYPE_ALL);
};

WCLWrapContext.prototype.getGraphicDevices = function() {
	if (this.getCurrentPlatform() === null) {
		throw new Error("You need a platform to select devices.");
	}

	return this.getCurrentPlatform().getDevices(WebCL.DEVICE_TYPE_GPU);
};

WCLWrapContext.prototype.generateBestGraphicContext = function(multipleDevices) {
	if ( this.getCurrentContext() !== null ) {
		throw new Error("A context is already in use. Release it before genereating a new one.");
	}

	var devicesJSON = contextSelector(multipleDevices);
	// By specification we can have only a context on a platform and not across platforms
	var platformId = devicesJSON[0].pid;
	// Fetch the devices id (should be only one if multipleDevices is false)
	var deviceIds = [];
	devicesJSON.forEach(function(el) { deviceIds.push( el.did ); });

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

	this.kernelName = kernelName;
	this.contextWrap = contextWrapper;
}

WCLWrapKernel.prototype.loadKernelFromFile = function(filePath) {
	this.kernelString = fs.readFileSync(filePath, 'ascii');
};

WCLWrapKernel.prototype.loadKernelFromString = function(kernelString) {
	this.kernelString = kernelString;
};

WCLWrapKernel.prototype.replaceKernelSourceVar = function(sourceVar, sourceContent) {
	this.kernelString = this.kernelString.replace(sourceVar, sourceContent);
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

// ************************** //

exports.WCLWrapContext = WCLWrapContext;
exports.WCLWrapKernel = WCLWrapKernel;

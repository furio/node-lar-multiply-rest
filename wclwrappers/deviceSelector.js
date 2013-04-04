/* jshint bitwise: false */

var WebCL = require('node-webcl'),
	basicWrap = require("./basicClass"),
	utils = require("./utils");

var DeviceSelector = {};

DeviceSelector._fetchAllPlatformsCL = function() {
	return WebCL.getPlatforms();
};

DeviceSelector._fetchPlatformDevices = function(platformObj) {
	if (!(platformObj instanceof basicWrap.WCLPlatform)) {
		throw new Error("It must be an instance of WebCLPlatform");
	}

	var platformDevices = platformObj.getPtrImplementation().getDevices(WebCL.DEVICE_TYPE_ALL);
	var possibleDevices = new Array(platformDevices.length);

	if ( platformDevices.length === 0 ) {
		return possibleDevices;
	}

	platformDevices.forEach(function(currDevice, i) {
		var currDevicetype = parseInt( currDevice.getInfo(WebCL.DEVICE_TYPE), 10 );
		var newDevice = new basicWrap.WCLDevice();

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
		var newPlatform = new basicWrap.WCLPlatform();

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

DeviceSelector.fetchSortedGraphicDevicesWithMoreWorkDimension = function() {
	var possiblePlatforms = this.fetchGraphicDevicesWithMoreWorkDimension();

	if ( !possiblePlatforms.some(function(el) { return (el.platformDevices.length > 0); }) ) {
		throw new Error("Not enough devices.");
	}

	possiblePlatforms.forEach(function(el) {
		el.platformDevices.sort( utils.dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );
	});

	return possiblePlatforms;
};

DeviceSelector.selectBestGraphicDevice = function() {
	var possiblePlatforms = this.fetchSortedGraphicDevicesWithMoreWorkDimension();

	var bestDevicePlatform = [];
	possiblePlatforms.forEach(function(el) {
		if(el.platformDevices.length > 0) {
			bestDevicePlatform.push(el.platformDevices[0]);
		}
	});
	bestDevicePlatform.sort( utils.dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );

	return bestDevicePlatform.splice(0,1);
};

DeviceSelector.selectBestGraphicPlatform = function() {
	var possiblePlatforms = this.fetchSortedGraphicDevicesWithMoreWorkDimension();

	var platformSummary = [];

	possiblePlatforms.forEach(function(currPlatform) {
		// Create a fake device that is the weighted sum of all devices for that platform
		var totalDevices = currPlatform.platformDevices.length;
		var summaryDevice = new basicWrap.WCLDevice();

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

	platformSummary.sort( utils.dynamicSortMultiple("coreUnits","globalMemory","maximumWorkgroupSize") );

	return platformSummary[0].platform.platformDevices;
};
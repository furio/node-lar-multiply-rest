var csr_matrix = require("./csrStuff").csr_matrix,
	WebCL = require('node-webcl'),
	fs = require('fs'),
	primeUtils = require("./primeUtils.js"),
	log = console.log;

// Platform const for my workspace
var NVIDIA = 0;
var INTEL = 1;
//
var PLATFORM_IN_USE = NVIDIA;

// =======================================

var getGoodSingleSize = function(X,Z,MINIMUM_DIVISORS,MAXIMUM_TRIES) {
	MAXIMUM_TRIES = MAXIMUM_TRIES || 20;
	MINIMUM_DIVISORS = MINIMUM_DIVISORS || 2;
	//
	var filterTooMuch = function(el) { return ((el > 1) && (el < Z)); };
	//
	var newX = X;
	var divX = 0;
	var i = 0;
	//

	// If we can get something decent in the next 20
	while (i <= MAXIMUM_TRIES) {
		newX += i;

		if ( !primeUtils.isPrime(newX) ) {
			var currList = primeUtils.listDivisors(newX).filter(filterTooMuch);
			// log(newX + "-" + currList.length);
			if ( currList.length >= MINIMUM_DIVISORS ) {
				currList = currList.reverse();
				// log(newX + "- L: " + currList);
				divX = currList[0];
				return [newX, divX];
			}
		}

		i += 1;
	}

	//
	throw new Error("Cannot find a suitable couple of divisors!");
};

var getGoodSizes = function(M,N,Z) {
	var maxSqrt = Math.ceil( Math.sqrt(Z) );
	// ----
	log("Calculating sizes ... [" + M + "," + N + "] Bound: [" + Z + "," + maxSqrt + "]");
	if ( (M*N) < Z ) {
		return [ [ M, N ], [ M, N ] ];
	}
	log("Calculating sizes ... complex way");
	var Msizes = getGoodSingleSize(M,maxSqrt);
	var Nsizes = getGoodSingleSize(N,maxSqrt);

	return [ [ Msizes[0], Nsizes[0] ], [ Msizes[1], Nsizes[1] ] ];
};

// =======================================

var f_clObject_add = function(obj, array) {
	array.push(obj);
};

var f_clObject_clear = function(array) {
	array = array.reverse();
	array.forEach(function(el) {
		el.release();
	});
	array.length = 0;
};

// =======================================

var f_multiplyMatrix = function(matA, matBx) {
	if (WebCL === undefined) {
		throw new Error("Unfortunately your system does not support WebCL. Make sure that you have the WebCL extension installed.");
	}

	// Keep reference of objects to call release
	var clObjects = [];

	// Transpose matBx for the algorithm in CL
	var matB = matBx.transpose();

	// Pick platform
	var platformList = WebCL.getPlatforms();
	var platform = platformList[PLATFORM_IN_USE];
	log('using platform: '+platform.getInfo(WebCL.PLATFORM_NAME));

	//Query the set of devices on this platform
	var devices = platform.getDevices(WebCL.DEVICE_TYPE_DEFAULT);
	var currDevice = devices[0];
	log('using device: '+currDevice.getInfo(WebCL.DEVICE_NAME));

	// Useful vars for later
	// BASIC VAR
	var context, program, kernel, queue;

	try {
		// create GPU context for this platform
		context = WebCL.createContext({
			deviceType: WebCL.DEVICE_TYPE_DEFAULT,
			platform: platform
		});
		f_clObject_add(context, clObjects);
	} catch(err) {
		f_clObject_clear(clObjects);
		log("Context error: " + err);
		throw new Error(err);
	}

	//Create and program from source
	var kernelSource = fs.readFileSync(__dirname + '/' + 'SpMSpM-Multiply-Naive.cl', 'ascii');
	kernelSource = kernelSource.replace("%%AROW%%", matA.getRowCount());
	kernelSource = kernelSource.replace("%%BCOL%%", matB.getRowCount());

	try {
		// Create program
		program = context.createProgram(kernelSource);
	} catch(err) {
		log("Program error: " + err);
		f_clObject_clear(clObjects);
		throw new Error(err);
	}

	try {
		// Build program
		program.build(devices);
		f_clObject_add(program, clObjects);
	} catch(err) {
		log("Program error: " + program.getBuildInfo(currDevice,WebCL.PROGRAM_BUILD_LOG));
		f_clObject_clear(clObjects);
		throw new Error(err);
	}

	var canWeUseBinaryKernel = matA.isBinary() && matB.isBinary();
	// Buffer vars
	var matA_rowptr, matA_colindices, matA_data,
			matB_rowptr, matB_colindices, matB_data,
			denseResult;

	try {
		// Create buffer for A and B no copy now
		matA_rowptr = context.createBuffer(WebCL.MEM_READ_ONLY, matA.getRowPointer().length*Uint32Array.BYTES_PER_ELEMENT);
		f_clObject_add(matA_rowptr, clObjects);
		matA_colindices = context.createBuffer(WebCL.MEM_READ_ONLY, matA.getColumnIndices().length*Uint32Array.BYTES_PER_ELEMENT);
		f_clObject_add(matA_colindices, clObjects);
		if ( canWeUseBinaryKernel === false ) {
			matA_data = context.createBuffer(WebCL.MEM_READ_ONLY, matA.getData().length*Float32Array.BYTES_PER_ELEMENT);
			f_clObject_add(matA_data, clObjects);
		}


		matB_rowptr = context.createBuffer(WebCL.MEM_READ_ONLY, matB.getRowPointer().length*Uint32Array.BYTES_PER_ELEMENT);
		f_clObject_add(matB_rowptr, clObjects);
		matB_colindices = context.createBuffer(WebCL.MEM_READ_ONLY, matB.getColumnIndices().length*Uint32Array.BYTES_PER_ELEMENT);
		f_clObject_add(matB_colindices, clObjects);
		if ( canWeUseBinaryKernel === false ) {
			matB_data = context.createBuffer(WebCL.MEM_READ_ONLY, matB.getData().length*Float32Array.BYTES_PER_ELEMENT);
			f_clObject_add(matB_data, clObjects);
		}

		// Create buffer for C to read results
		denseResult = context.createBuffer(WebCL.MEM_WRITE_ONLY, (matA.getRowCount()*matBx.getColCount())*Float32Array.BYTES_PER_ELEMENT);
		f_clObject_add(denseResult, clObjects);
	} catch(err) {
		f_clObject_clear(clObjects);
		log("Error creating buffers: " + err);
		throw new Error(err);
	}

	// Create kernel object
	try {
		kernel = program.createKernel(( canWeUseBinaryKernel === true ) ? "spmm_binary_kernel_naive" : "spmm_kernel_naive");
		f_clObject_add(kernel, clObjects);
	} catch(err) {
		log("Error creating kernel: " + program.getBuildInfo(currDevice,WebCL.PROGRAM_BUILD_LOG));
		f_clObject_clear(clObjects);
		throw new Error(err);
	}

	// Set kernel args
	var argcKernel = 0;
	kernel.setArg(argcKernel, matA_rowptr);
	argcKernel += 1;
	kernel.setArg(argcKernel, matA_colindices);
	argcKernel += 1;
	if ( canWeUseBinaryKernel === false ) {
		kernel.setArg(argcKernel, matA_data);
		argcKernel += 1;
	}
	kernel.setArg(argcKernel, matB_rowptr);
	argcKernel += 1;
	kernel.setArg(argcKernel, matB_colindices);
	argcKernel += 1;
	if ( canWeUseBinaryKernel === false ) {
		kernel.setArg(argcKernel, matB_data);
		argcKernel += 1;
	}
	kernel.setArg(argcKernel, denseResult);

	// Create command queue
	try {
		queue = context.createCommandQueue(currDevice, 0);
		f_clObject_add(queue, clObjects);
	} catch(err) {
		f_clObject_clear(clObjects);
		log("Error creating queue: " + err);
		throw new Error(err);
	}

	var arraySizes, globalWS, localWS;
	var globalOff = null;
	var maxWorkSize = currDevice.getInfo(WebCL.DEVICE_MAX_WORK_GROUP_SIZE); // kernel.getWorkGroupInfo(currDevice, WebCL.KERNEL_WORK_GROUP_SIZE);

	try {
		arraySizes = getGoodSizes(matA.getRowCount(), matB.getRowCount(), maxWorkSize);
		globalWS = arraySizes[0];
		localWS = arraySizes[1];
	} catch(err) {
		f_clObject_clear(clObjects);
		log(err);
		throw new Error(err);
	}


	log("DEVICE_MAX_WORK_GROUP_SIZE: " + maxWorkSize);
	log("Global offset size: " + globalOff);
	log("Global work item size: " + globalWS);
	log("Local work item size: " + localWS);

	// The result
	var MATRIX_RES;

	try {
		// and copy host contents
		queue.enqueueWriteBuffer(matA_rowptr, false, 0, matA.getRowPointer().length*Uint32Array.BYTES_PER_ELEMENT, matA.getRowPointer(true));
		queue.enqueueWriteBuffer(matA_colindices, false, 0, matA.getColumnIndices().length*Uint32Array.BYTES_PER_ELEMENT, matA.getColumnIndices(true));
		if ( canWeUseBinaryKernel === false ) {
			queue.enqueueWriteBuffer(matA_data, false, 0, matA.getData().length*Float32Array.BYTES_PER_ELEMENT, matA.getData(true));
		}

		queue.enqueueWriteBuffer(matB_rowptr, false, 0, matB.getRowPointer().length*Uint32Array.BYTES_PER_ELEMENT, matB.getRowPointer(true));
		queue.enqueueWriteBuffer(matB_colindices, false, 0, matB.getColumnIndices().length*Uint32Array.BYTES_PER_ELEMENT, matB.getColumnIndices(true));
		if ( canWeUseBinaryKernel === false ) {
			queue.enqueueWriteBuffer(matB_data, false, 0, matB.getData().length*Float32Array.BYTES_PER_ELEMENT, matB.getData(true));
		}

		// Execute (enqueue) kernel
		queue.enqueueNDRangeKernel(kernel, globalOff, globalWS, localWS);

		MATRIX_RES = new Float32Array( matA.getRowCount()*matBx.getColCount() );
		queue.enqueueReadBuffer(denseResult, true, 0, MATRIX_RES.length*Float32Array.BYTES_PER_ELEMENT, MATRIX_RES);

		// finish
		queue.finish();
		queue.flush();
	} catch(err) {
		f_clObject_clear(clObjects);
		log("Errors in memory copy - kernel execution: " + err);
		throw new Error(err);
	}

	// Hope
	f_clObject_clear(clObjects);

	return {"fromdense": MATRIX_RES, "numcols": matBx.getColCount()};
};

var f_multiplyMatrixNewKern = function(matA, matBx) {
	throw new Error("To be implemented");
};

var f_commonStartup = function(matA, matBx, enableLogging, newKernel) {
	if (enableLogging === false) {
		log = function(){};
	} else {
		log = console.log;
	}

	if ( newKernel ) {
		return new csr_matrix( f_multiplyMatrixNewKern(matA, matBx) );
	}

	return new csr_matrix( f_multiplyMatrix(matA, matBx) );
};

exports.multiplyMatrix = function(matA, matBx, enableLogging) {
	enableLogging = enableLogging || false;
	return f_commonStartup(matA, matBx, enableLogging, false);
};

exports.multiplyMatrixNew = function(matA, matBx, enableLogging) {
	enableLogging = enableLogging || false;
	return f_commonStartup(matA, matBx, enableLogging, true);
};
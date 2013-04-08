/*

WebCLArrayContainer(typedArray, length)
|
|
+ - STATIC::kMaxLength (from js engine)
|
+ - length
|
+ - kMaxLength/length typedArray in object map
|
+ - get() / set()
|
+ - readFromWebCLBuffer(queue, CLbuffer, startOffset, size) async or sync or events?
|
+ - writeToWebClBuffer(queue, CLbuffer, startOffset, size) async or sync or events?
|
+ - fromJSArray(jsArray, destinationType)
*/

var WebCL = require('node-webcl'),
	log = require("./logging.js").log;

// STATIC LENGTH
var V8ArrayBufferMaxLength = 0x3fffffff;

// LINKS
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;

var WebCLArrayContainer =
exports.WebCLArrayContainer = function(typedArray, arrayLen) {
	if ( !typedArray.hasOwnProperty("BYTES_PER_ELEMENT") ) {
		throw new Error("Not a typed array");
	}

	if (arguments.length == 1) {
		throw new Error("Not a valid length");
	} else if (arguments.length == 2) {
		if ( isNaN(arrayLen) || ( arrayLen <= 0 ) ) {
			throw new Error("Not a valid length");
		}
	}

	//
	var m_typedArray = typedArray;
	var m_arrayLen = arrayLen;
	var m_container = [];

	this.getEngineMaxByteLength = function() {
		return V8ArrayBufferMaxLength;
	};

	this.getTypedArrayLength = function() {
		return m_typedArray.BYTES_PER_ELEMENT;
	};

	this.getMaxElements = function() {
		return Math_floor( this.getEngineMaxByteLength() / this.getTypedArrayLength() );
	};

	this.getArrayLength = function() {
		return m_arrayLen;
	};

	var mf_getContainerPosition = function(pos) {
		return Math_floor( pos / this.getMaxElements() );
	};

	var mf_getInsidePosition = function(pos) {
		return ( pos % this.getMaxElements() );
	};

	this.get = function(pos) {
		if ( pos >= this.getArrayLength() ) {
			throw new Error("Not a valid position");
		}

		var tmpArr = m_container[mf_getContainerPosition(pos)];
		return tmpArr[mf_getInsidePosition(pos)];
	};

	this.set = function(pos, elem) {
		if ( pos >= this.getArrayLength() ) {
			throw new Error("Not a valid position");
		}

		var tmpArr = m_container[mf_getContainerPosition(pos)];
		tmpArr[mf_getInsidePosition(pos)] = elem;
	};

	var mf_Init = function() {
		var howMany = Math_ceil( this.getArrayLength() / this.getMaxElements() );
		for(var i = 0; i < howMany; i++) {
			m_container[i] = new m_typedArray( this.getMaxElements() );
		}
	};

	// Init the array
	mf_Init();


	// this copy data from a graphic device to the array
	this.retrieveFromCLBuffer = function(buffer, bufferLen, queue) {
		if (bufferLen != this.getArrayLength()) {
			throw new Error("Copy operation must be performed on equal length objects");
		}

		var singleLength = this.getMaxElements();
		var offsetLength = singleLength;
		for(var i = 0; i < m_container.length; i++) {
			if ( (bufferLen - (i * singleLength)) < singleLength ) {
				singleLength = bufferLen % offsetLength;
			}
			queue.enqueueReadBuffer(buffer, false, i * offsetLength, singleLength * this.getTypedArrayLength(), m_container[i]);
		}

		queue.finish();
	};

	// this copy data to a graphic device from the array
	this.writeToCLBuffer = function(buffer, bufferLen, queue) {
		if (bufferLen != this.getArrayLength()) {
			throw new Error("Copy operation must be performed on equal length objects");
		}

		var singleLength = this.getMaxElements();
		var offsetLength = singleLength;
		for(var i = 0; i < m_container.length; i++) {
			if ( (bufferLen - (i * singleLength)) < singleLength ) {
				singleLength = bufferLen % offsetLength;
			}
			queue.enqueueWriteBuffer(buffer, false, i * offsetLength, singleLength * this.getTypedArrayLength(), m_container[i]);
		}

		queue.finish();
	};

	// this returns a js array from this container
	this.toJsArray = function() {
		var retArray = [];

		for(var i = 0; i < m_container.length; i++) {
			retArray.concat( Array.prototype.slice.call( m_container[i] ) );
		}

		return retArray;
	};

	// this put data from a js array
	this.fromJsArray = function(arr) {
		if (arr.length != this.getArrayLength()) {
			throw new Error("Copy operation must be performed on equal length objects");
		}

		// TODO: horrible, let use some rebuilding and constructors and let node sort it for us

		arr.forEach(function(el,idx) {
			this.set(idx,el);
		});
	};
};
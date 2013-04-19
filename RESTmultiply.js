var USE_CLUSTER = false;
var USE_WEBCL = false;
var WEBPORT = 3000;

// Proto libraries
require("./string.prototype.js");
// Library from NPM
var i_express = require('express'),
	i_gzippo = require('gzippo'),
	i_cluster = require('cluster'),
	i_os = require('os'),
// Custom libraries
	csr_matrix = require("./csrStuff").csr_matrix,
	g_webcl = USE_WEBCL ? require("./SpMSpM-Multiply.js") : null,
	g_apikey = require("./apikey"),
	g_utils = require("./utils"),
// Log shortcut
	log = require("./logging.js").log;

var numCPUs = i_os.cpus().length;
var CLUSTER_CHILDS = 1 * numCPUs;

var loadLateWebCL = function() {
	if (USE_WEBCL === true) {
		g_webcl = require("./SpMSpM-Multiply.js");
	}
};

process.argv.forEach(function(val, index, array) {
	if ( val === "--webcl" ) {
		USE_WEBCL = true;
		loadLateWebCL();
	} else if ( val === "--cluster" ) {
		USE_CLUSTER = true;
	} else if ( val.startsWith("--port=") ) {
		var newPort = val.slice("--port=".length);
		if ( g_utils.isUnsignedInteger(newPort) && ( newPort < 65535 ) ) {
			WEBPORT = newPort;
		}
	}
});

var startClusterServer = function(isCluster) {
	if ( isCluster === true ) {
		if ( i_cluster.isMaster ) {
			log.info("Starting a cluster of services with " + CLUSTER_CHILDS + " child(s).");
			for ( var i = 0; i < CLUSTER_CHILDS; ++i ) {
				i_cluster.fork();
			}
			/*
			i_cluster.on('disconnect', function(worker) {
				log.error('server child disconnect!');
				i_cluster.fork();
			});
			*/
		} else {
			childServer(isCluster);
		}
	} else {
		childServer(isCluster);
	}
};

var childServer = function(isCluster) {
	// App and server placeholder
	var CURRENT_SERVER = null;
	var app = i_express();

	// Startup function
	var startServer = function(worker) {
		CURRENT_SERVER = app.listen(WEBPORT);
		log.info("Starting 'Matrix Multiply REST service'.");
		log.info("Listening on port: " + WEBPORT + ".");
		log.info("WebCl enabled: " + USE_WEBCL + ".");
	};

	// Function type check
	var isFunction = function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	};

	// 
	var callNodeGC = function() {
		if ( (typeof gc !== 'undefined') && isFunction(gc) ) {
			gc();
		}
	};

	if (isCluster === false) {
		// Catch SIGINT
		process.on('SIGINT', function() {
			log.warn('Caught SIGINT. Trying to close gracefully.');

			// Kill server if online
			if (CURRENT_SERVER !== null) {
				CURRENT_SERVER.close();
			}

			// Add here WebCl.releaseAll()

			// If the GC is exposed call it
			callNodeGC();

			// Exit process
			process.exit();
		});
	}

	// Redifine app.listen to disable NAGLE
	app.listen = function(){
		var server = require('http').createServer(this);
		server.on("connection", function (socket) { socket.setNoDelay(true); });
		return server.listen.apply(server, arguments);
	};

	app.configure(function(){
		// Title
		app.set('title', 'Multiply service');
		// REST errors
		app.set('format_error', 'Wrong URI format.');
		app.set('format_error_input', 'Wrong parameters format.');
		// Request parser
		app.use(i_gzippo.compress());
		app.use(i_express.bodyParser());
		app.use(app.router);
	});

	var makeOk = function(s) {
		return {'STATUS' : '1'};
	};

	var callReturnFunction = function(res) {
		return function(error, JSONdata) {
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			if (error !== null) {
				res.send(500, 'Something is broken!\n\nDetails: ' + error + '\n\n');
			} else {
				log.info("Sending results through net (async).");
				if ( JSONdata !== null ) {
					res.json( JSONdata );
				} else {
					res.json( makeOk() );
				}
			}
		};
	};

	app.get('/', function(req, res) {
		var dataOut = 'Service UP.';
		res.send(dataOut);
	});
        
        app.all('/*', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,POST");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");

		next();
        });
        
	app.all('/service/:key/*', function(req, res, next) {
		if ( g_apikey.isValidKey( req.params.key ) ) {
			log.info("Key " + req.params.key + " is valid.");
			next();
		} else {
			res.send(401);
		}
	});

	app.get('/service/:key/networktest', function(req,res){
		log.info("GET /service/:key/networktest");
		// A network performance test
		callReturnFunction(res)( null, {"array": require("./matrixGenerator.js").generateBinaryMatrix(2000,500) } );
	});

	app.post('/service/:key/multiply', function(req,res){
		log.info("POST /service/:key/multiply");
		if ( req.hasOwnProperty("body") ) {
			if ( req.body.hasOwnProperty("matrixa") && req.body.hasOwnProperty("matrixb") ) {
				var matrixA = req.body.matrixa;
				var matrixB = req.body.matrixb;

				try {
					var resultMat = f_multiply_matrices( JSON.parse(matrixA), JSON.parse(matrixB) );
					callReturnFunction(res)( null, resultMat );
				} catch(err) {
					log.info("Wrong POST request: Error while multipling: " + err);
					callReturnFunction(res)( err );
				}
			} else {
				log.info("Wrong POST request: no matrixa/matrixb");
				callReturnFunction(res)( app.get('format_error_input') );
			}
		} else {
			log.info("Wrong POST request: no body");
			callReturnFunction(res)( app.get('format_error') );
		}
	});

	var f_multiply_matrices = function(matrixA, matrixB) {
		// Import the matrices
		log.silly("Importing first matrix");
		var csrA, csrB;

		if (matrixA.hasOwnProperty("DATA")) {
			csrA = new csr_matrix({"numrows": matrixA.ROWCOUNT, "numcols": matrixA.COLCOUNT,
									"rowptr": matrixA.ROW, "colindices": matrixA.COL, "data": matrixA.DATA});
		} else {
			csrA = new csr_matrix({"numrows": matrixA.ROWCOUNT, "numcols": matrixA.COLCOUNT,
									"rowptr": matrixA.ROW, "colindices": matrixA.COL});
		}
		log.silly("Imported first matrix: " + csrA.getRowCount() + "x" + csrA.getColCount() );

		log.silly("Importing second matrix");
		if (matrixB.hasOwnProperty("DATA")) {
			csrB = new csr_matrix({"numrows": matrixB.ROWCOUNT, "numcols": matrixB.COLCOUNT,
									"rowptr": matrixB.ROW, "colindices": matrixB.COL, "data": matrixB.DATA});
		} else {
			csrB = new csr_matrix({"numrows": matrixB.ROWCOUNT, "numcols": matrixB.COLCOUNT,
									"rowptr": matrixB.ROW, "colindices": matrixB.COL});
		}
		log.silly("Imported second matrix: " + csrB.getRowCount() + "x" + csrB.getColCount() );

		log.silly("Calculating multiplication");
		var mulStep = null;
		if (USE_WEBCL) {
			mulStep = g_webcl.multiplyMatrix(csrA, csrB, true);
			callNodeGC();
		} else {
			mulStep = csrA.multiply( csrB );
		}
		log.info("Calculated multiplication. Result matrix: " + mulStep.getRowCount() + "x" + mulStep.getColCount() );

		return mulStep.toJSON();
	};

	// Start the server
	startServer();
};

// Start cluster
startClusterServer(USE_CLUSTER);

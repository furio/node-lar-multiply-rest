var USE_CLUSTER = false;
var USE_WEBCL = true;

// Library from NPM
var i_express = require('express'),
	i_gzippo = require('gzippo'),
	i_cluster = require('cluster'),
// Custom libraries
	csr_matrix = require("./csrStuff").csr_matrix,
	g_webcl = USE_WEBCL ? require("./SpMSpM-Multiply.js") : null,
// Log shortcut
	log = console.log;

var numCPUs = require('os').cpus().length;
var CLUSTER_CHILDS = 1 * numCPUs;

var startClusterServer = function(isCluster) {
	if ( isCluster === true ) {
		if ( i_cluster.isMaster ) {
			log("Starting a cluster of services with " + CLUSTER_CHILDS + " child(s).");
			for ( var i = 0; i < CLUSTER_CHILDS; ++i ) {
				i_cluster.fork();
			}
		} else {
			childServer(isCluster);
		}
	} else {
		childServer(isCluster);
	}
};

var childServer = function(isCluster) {
	// Service configurations
	var WEBPORT = 3000;

	// App and server placeholder
	var CURRENT_SERVER = null;
	var app = i_express();

	// Startup function
	var startServer = function(worker) {
		CURRENT_SERVER = app.listen(WEBPORT);
		log("Starting 'Matrix Multiply REST service'.");
		log("Listening on port: " + WEBPORT +".");
		log("WebCl enabled: " + USE_WEBCL+".");
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
			log('Caught SIGINT. Trying to close gracefully.');

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
				log("Sending results through net (async).");
				if ( JSONdata !== null ) {
					res.json( JSONdata );
				} else {
					res.json( makeOk() );
				}
			}
		};
	};

	app.get('/networktest', function(req,res){
		log("GET /networktest");
		// A network performance test
		callReturnFunction(res)( null, {"array": require("./matrixGenerator.js").generateBinaryMatrix(2000,500) } );
	});

	app.post('/multiply', function(req,res){
		log("POST /multiply");
		if ( req.hasOwnProperty("body") ) {
			if ( req.body.hasOwnProperty("matrixa") && req.body.hasOwnProperty("matrixb") ) {
				var matrixA = req.body.matrixa;
				var matrixB = req.body.matrixb;

				try {
					var resultMat = f_multiply_matrices( JSON.parse(matrixA), JSON.parse(matrixB) );
					callReturnFunction(res)( null, resultMat );
				} catch(err) {
					callReturnFunction(res)( err );
				}
			} else {
				callReturnFunction(res)( app.get('format_error_input') );
			}
		} else {
			callReturnFunction(res)( app.get('format_error') );
		}
	});

	var f_multiply_matrices = function(matrixA, matrixB) {
			// Import the matrices
		log("Importing first matrix");
		var csrA = new csr_matrix({"numrows": matrixA.ROWCOUNT, "numcols": matrixA.COLCOUNT,
									"rowptr": matrixA.ROW, "colindices": matrixA.COL, "data": matrixA.DATA});
		log("Imported first matrix: " + csrA.getRowCount() + "x" + csrA.getColCount() );

		log("Importing second matrix");
		var csrB = new csr_matrix({"numrows": matrixB.ROWCOUNT, "numcols": matrixB.COLCOUNT,
									"rowptr": matrixB.ROW, "colindices": matrixB.COL, "data": matrixB.DATA});
		log("Imported second matrix: " + csrB.getRowCount() + "x" + csrB.getColCount() );

		log("Calculating multiplication");
		var mulStep = null;
		if (USE_WEBCL) {
			mulStep = g_webcl.multiplyMatrix(csrA, csrB, true);
			callNodeGC();
		} else {
			mulStep = csrA.multiply( csrB );
		}
		log("Calculated multiplication. Result matrix: " + mulStep.getRowCount() + "x" + mulStep.getColCount() );

		log("Returning result");
		return mulStep.toJSON();
	};

	// Start the server
	startServer();
};

// Start cluster
startClusterServer(USE_CLUSTER);
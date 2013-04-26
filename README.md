node-lar-multiply-rest
======================

A simple REST module that performs sparse matrix multiplication through WebCL/WebGL for the [LAR](https://github.com/cvdlab/larpy)/[LAR.js](https://github.com/cvdlab/lar-demo) project

## Requirements

* node-webcl ([patched version](https://github.com/furio/node-webcl))
* express
* gzippo
* winston _(logging)_
* mocha, should _(testing)_

## Installing

1. Clone this repository
2. Enter the repository directory
3. `npm install` **OR** `CPLUS_INCLUDE_PATH=$OPENCL_INCLUDE_DIR npm install`

Note that if you incur in some problems, they might be related to the module requires "node-webcl":
you need to install also its own dependencies that don't get installed automatically ([read here](https://github.com/furio/node-webcl/blob/master/README.md#dependencies))

## Startup

Start server with `npm run-script run` (with default arguments)

**OR**

Start server with `./startREST.sh` (*NIX flavour) or `node RESTMultiply.js`. Possible arguments:
* --no-webcl (disable WebCL backend) _Default: false_
* --cluster (enable cluster). _Default: false_
* --port=1234 (use port 1234 to serve request). _Default: 3000_
* --key=dln (use string "dln" as api key for this instance).

## REST Endpoint

The REST endpoint is (with a proper HTTP POST) http://HOST:PORT/service/APIKEY/multiply

## License

(The MIT License)

Copyright (c) 2013 Francesco Furiani

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

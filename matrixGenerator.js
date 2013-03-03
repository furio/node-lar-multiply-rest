var f_rand = Math.random;

var f_generateBinaryMatrix = function(rows, columns, max_nnzperrow) {
	max_nnzperrow = max_nnzperrow || columns;
	var result = [];
	var len = rows*columns;

	var i = Math.min(max_nnzperrow, columns);
    while(len--){
        result.push( (i && (f_rand() >= f_rand())) ? (i--,1) : 0);
        i = ((len % columns) === 0) ? Math.min(max_nnzperrow, columns) : i;
    }

    return result;
};

exports.generateBinaryMatrix = f_generateBinaryMatrix;
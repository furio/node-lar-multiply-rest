var f_rand = Math.random;

var f_generateBinaryMatrix = function(rows, columns) {
	var result = [];
	var len = rows*columns;

    while(len--){
        result.push((f_rand() >= f_rand()) ? 1 : 0);
    }

    return result;
};

exports.generateBinaryMatrix = f_generateBinaryMatrix;
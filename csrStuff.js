exports.csr_matrix = csr_matrix;

function csr_matrix(objargs) {
	// CSR Data
	this.rowptr = null;
	this.col = null;
	this.data = null;
	// Useful for various calc
	this.numrow = 0;
	this.lastcolumn = 0;
	this.nnz = 0;
	// BaseIndexing
	this.baseIndex = 0;

	this.loadData(objargs);
}

csr_matrix.prototype.getRowPointer = function(useTypedArrays) {
	useTypedArrays = useTypedArrays || false;

	if (useTypedArrays) {
		var tmp_rowptr = new Uint32Array(this.rowptr.length);
		this.rowptr.forEach(function(i,idx) { tmp_rowptr[idx] = i; } );
		return tmp_rowptr;
	} else {
		return this.rowptr;	
	}
}

csr_matrix.prototype.getColumnIndices = function(useTypedArrays) {
	useTypedArrays = useTypedArrays || false;

	if (useTypedArrays) {
		var tmp_col = new Uint32Array(this.col.length);
		this.col.forEach(function(i,idx) { tmp_col[idx] = i; } );
		return tmp_col;
	} else {
		return this.col;	
	}
}

csr_matrix.prototype.getData = function(useTypedArrays) {
	useTypedArrays = useTypedArrays || false;

	if (useTypedArrays) {
		var tmp_data = new Float32Array(this.data.length);
		this.data.forEach(function(i,idx) { tmp_data[idx] = i; } );
		return tmp_data;
	} else {
		return this.data;	
	}
}

csr_matrix.prototype.isBinary = function() {
	return this.data.every(function(el) { return (el == 1); } );
}

csr_matrix.prototype.getRowCount = function() {
	return this.numrow;
}

csr_matrix.prototype.getColCount = function() {
	return this.lastcolumn;
}

csr_matrix.prototype.getNonZeroElementsCount = function() {
	return this.nnz;
}

csr_matrix.prototype.loadData = function(objargs) {
	// possibili casi
	if ( !objargs.hasOwnProperty("numcols") ) {
		objargs.numcols = 0;
	}

	if (objargs.hasOwnProperty("numrows") && objargs.hasOwnProperty("rowptr") && objargs.hasOwnProperty("colindices") && objargs.hasOwnProperty("data")) {
		if (objargs.colindices.length != objargs.data.length) {
			throw new Error('Expected objargs.colindices.length == objargs.data.length');
		}

		var tmp_rowptr = new Array(objargs.rowptr.length);
		var tmp_col = new Array(objargs.colindices.length);
		var tmp_colMax = 0;
		var tmp_data = new Array(objargs.data.length);

		objargs.rowptr.forEach(function(i,idx) { tmp_rowptr[idx] = i; } );
		objargs.colindices.forEach(function(i,idx) { tmp_col[idx] = i; tmp_colMax = Math.max(tmp_colMax,i+1); } );
		objargs.data.forEach(function(i,idx) { tmp_data[idx] = i; } );

		this.rowptr = tmp_rowptr;
		this.col = tmp_col;
		this.data = tmp_data;
		this.numrow = objargs.numrows;
		this.lastcolumn = Math.max(tmp_colMax, objargs.numcols);
		this.nnz = this.data.length;

	} else if (objargs.hasOwnProperty("numrows") && objargs.hasOwnProperty("rowptr") && objargs.hasOwnProperty("colindices")) {

		var tmp_rowptr = new Array(objargs.rowptr.length);
		var tmp_col = new Array(objargs.colindices.length);
		var tmp_colMax = 0;
		var tmp_data = new Array(objargs.colindices.length);

		objargs.rowptr.forEach(function(i,idx) { tmp_rowptr[idx] = i; } );
		objargs.colindices.forEach(function(i,idx) { tmp_col[idx] = i; tmp_colMax = Math.max(tmp_colMax,i+1); } );
		objargs.data.forEach(function(i,idx) { tmp_data[idx] = 1; } );

		this.rowptr = tmp_rowptr;
		this.col = tmp_col;
		this.data = tmp_data;
		this.numrow = objargs.numrows;
		this.lastcolumn = Math.max(tmp_colMax, objargs.numcols);
		this.nnz = this.data.length;

	} else if (objargs.hasOwnProperty("size")) {
		// 0 everywhere

		this.rowptr = new Array();
		this.col = new Array();
		this.data = new Array();

		this.numrow = objargs.size.row;
		this.lastcolumn = objargs.size.col;
		this.nnz = 0;

	} else if (objargs.hasOwnProperty("fromtriples")) {
		// leggi da file le triple e genera
	} else if (objargs.hasOwnProperty("fromdense") && (objargs.numcols > 0)) {
		var tmp_rowPtr = new Array();
		var tmp_colIdx = new Array();
		var tmp_data = new Array();
		var nnz = 0;
		var colIdx = 0;
		var rowCount = 0;
		var prevRow = this.baseIndex-1;

		for (var i = 0; i < objargs.fromdense.length; i++, colIdx++) {
			if (prevRow != rowCount) {
				tmp_rowPtr.push( nnz );
				prevRow = rowCount;
			}

			if ( objargs.fromdense[i] != 0 ) {
				tmp_colIdx.push( colIdx );
				tmp_data.push( objargs.fromdense[i] );
				nnz += 1;
			}

			if ((colIdx+1) == objargs.numcols) {
				colIdx = -1;
				rowCount += 1;
			}		
		}

		// Add last nnz
		tmp_rowPtr.push( tmp_data.length );	

		this.loadData({"numrows": rowCount, "numcols": objargs.numcols, "rowptr": tmp_rowPtr, "colindices": tmp_colIdx, "data": tmp_data});
	}
}

csr_matrix.prototype.transpose = function() {
	// private function
	var f_transposeEnum = function(inputArray, maxN, outputArray) {
	  if (maxN == 0) {
	  	return;
	  }
	    
	  outputArray[0] = 0;
	  for (var i = 1; i <= maxN; i++) {
	  	outputArray[i] = outputArray[i - 1] + inputArray[i - 1];
	  }
	};

	// lookup
	var m = this.numrow; 
	var n = this.lastcolumn;
	var base = this.baseIndex;

	// NNZ elements
	var nnz = this.rowptr[m] - base;

	// New arrays
	var newPtr = new Array(n + 1);
	var newCol = new Array(nnz);
	var newData = new Array(nnz);
	// Create and initialize to 0
	var count_nnz = this.__newFilledArray(n, 0);

	// Reused index
	var i = 0;

	// Count nnz per column
	for(i = 0; i < nnz; i++) {
		count_nnz[(this.col[i] - base)]++;
	}

	// Create the new rowPtr
	f_transposeEnum(count_nnz, n, newPtr);

	// Copia TrowPtr in moda tale che count_nnz[i] == location in Tind, Tval
	for(i = 0; i < n; i++) {
		count_nnz[i] = newPtr[i];
	}

	// Copia i valori in posizione
	for(i = 0; i < m; i++) {
		var k;
		for (k = (this.rowptr[i] - base); k < (this.rowptr[i+1] - base); k++ ) {
			var j = this.col[k] - base;
			var l = count_nnz[j];

			newCol[l] = i;
			newData[l] = this.data[k];
			count_nnz[j]++;
		}
	}

	return new csr_matrix({"numrows": n, "numcols": m, "rowptr": newPtr, "colindices": newCol, "data": newData});
}

csr_matrix.prototype.toDense = function() {
	var rowArray = new Array(this.getRowCount());
	for(var i = 0; i < (this.getRowPointer().length - 1); i++) {
		var columnAdd = this.__newFilledArray(this.getColCount(), 0);
		for(var k = this.getRowPointer()[i]; k < this.getRowPointer()[i+1]; k++ ) {
			columnAdd[ this.getColumnIndices()[k] ] = this.getData()[k];
		}
		rowArray[i] = columnAdd;
	}

	return rowArray;
}

csr_matrix.prototype.multiply = function(matrix) {
	if ((matrix instanceof csr_matrix) === false) {
		throw new Error("Invalid matrix");
	}
/*
	// WARN: Commented for python-bridge
	if ( this.getColCount() != matrix.getRowCount() ) {
		throw new Error("Invalid matrix size");
	}
*/
	var newRowCount = this.getRowCount();
	var newColCount = matrix.getColCount();

	var tmpCol = this.__newFilledArray(newColCount, -1);
	var newRow = this.__newFilledArray(newRowCount+1, 0);

	// Primo step
	var i = 0, k = 0, j = 0, l = 0, cntLoop = 0;
	for(i = 0; i < newRowCount; i++) {
		cntLoop = 0;

		for(k = this.getRowPointer()[i]; k < this.getRowPointer()[i+1]; k++ ) {
			for(j = matrix.getRowPointer()[this.getColumnIndices()[k]]; j < matrix.getRowPointer()[this.getColumnIndices()[k]+1]; j++ ){
				for(l = 0; l < cntLoop; l++ ) {
					if (tmpCol[l] == matrix.getColumnIndices()[j]) {
						break;
					}
				}

				if (l == cntLoop) {
					tmpCol[cntLoop] = matrix.getColumnIndices()[j];
					cntLoop++;
				}
			}
		}

		newRow[i+1] = cntLoop;
 		for (j=0; j < cntLoop; j++) {
			tmpCol[j] = -1;
		}
	}

	for(i=0; i < newRowCount; i++) {
		newRow[i+1] += newRow[i];
	}

	// secondo step
	var newCol = this.__newFilledArray(newRow[newRowCount], 0);

	for (i = 0; i < newRowCount; i++) {
		var countTmpCol = 0;
		cntLoop = newRow[i];
		for (k = this.getRowPointer()[i]; k < this.getRowPointer()[i+1]; k++) {
			for (j = matrix.getRowPointer()[this.getColumnIndices()[k]]; j < matrix.getRowPointer()[this.getColumnIndices()[k]+1]; j++) {
				for (l = 0; l < countTmpCol; l++) {
					if (tmpCol[l] == matrix.getColumnIndices()[j]) {
						break;	
					} 
				}
				
				if (l == countTmpCol) {
					newCol[cntLoop] = matrix.getColumnIndices()[j];
					tmpCol[countTmpCol] = matrix.getColumnIndices()[j];
					cntLoop++;
					countTmpCol++;
				}
			}
		}
 
		for (j=0; j < countTmpCol; j++) {
			tmpCol[j] = -1;	
		} 
	}

	// terzo step
	var newData = this.__newFilledArray(newRow[newRowCount], 0);

	for (i = 0; i < newRowCount; i++) {
		for ( j = newRow[i]; j < newRow[i+1]; j++) {
			// newData[j] = 0;
			for (k = this.getRowPointer()[i]; k < this.getRowPointer()[i+1]; k++) {
				for ( l = matrix.getRowPointer()[this.getColumnIndices()[k]]; l < matrix.getRowPointer()[this.getColumnIndices()[k]+1]; l++) {
					if (matrix.getColumnIndices()[l] == newCol[j]) {
						newData[j] += this.getData()[k] * matrix.getData()[l];
					}
				}
			}
		}
	}

	return new csr_matrix({"numrows": newRowCount, "numcols": newColCount, "rowptr": newRow, "colindices": newCol, "data": newData});
}

csr_matrix.prototype.toString = function() {
	var outString = "Sparse Matrix ("+this.numrow+" x "+this.lastcolumn+") Nnz: "+this.nnz+"\n";
	outString += "RowPtr " + this.rowptr + "\n";
	outString += "Column Indices " + this.col + "\n";
	outString += "Data " + this.data + "\n";	

	return outString;
}

csr_matrix.prototype.toJSON = function() {
	return {"ROW" : this.getRowPointer(), 
			"COL": this.getColumnIndices(), 
			"DATA": this.getData(), 
			"ROWCOUNT": this.getRowCount(), 
			"COLCOUNT": this.getColCount()};
}

csr_matrix.prototype.__newFilledArray = function(len, val) {
    var a = [];
    while(len--){
        a.push(val);
    }
    return a;
}
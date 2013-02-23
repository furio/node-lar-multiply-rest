csr_matrix = require("../csrStuff.js").csr_matrix;
f_generateBinaryMatrix = require("../matrixGenerator.js").generateBinaryMatrix;

should = require('should');
log=console.log;

describe('csr_matrix', function(){
	var dense = [1,0,0,0,1,
				 0,1,0,0,0,
				 0,0,0,0,1,
				 0,0,1,1,0];

	var denseT = [1,0,0,0,
			 	  0,1,0,0,
				  0,0,0,1,
				  0,0,0,1,
				  1,0,1,0];

	var ddTMultiply = [2,0,1,0,
					   0,1,0,0,
					   1,0,1,0,
					   0,0,0,2];

	var arrayEqualsV8 = function(a,b) { return !(a<b || b<a); };
	var arrayFlatten = function(c) { c.reduce(function(a, b) { return a.concat(b); }) };

	var csr_dense, csr_denseT, csr_multiply;

	before(function(){
		csr_dense = new csr_matrix({"fromdense": dense, "numcols": 5});
		csr_denseT = new csr_matrix({"fromdense": denseT, "numcols": 4});
		csr_multiply = new csr_matrix({"fromdense": ddTMultiply, "numcols": 4});
	})

	describe('#({"fromdense":"['+dense+']","numcols":"5"})', function(){
		it('should return 4x5 csr_matrix', function(){
			csr_dense.getRowCount().should.equal(4);
			csr_dense.getColCount().should.equal(5);
		});

		it('should return a 6 nnz csr_matrix', function(){
			csr_dense.getNonZeroElementsCount().should.equal(6);
			csr_dense.getColumnIndices().should.have.length(6);
		});

		it('should contain proper rowPtr array [0, 2, 3, 4, 6]', function(){
			arrayEqualsV8([0, 2, 3, 4, 6], csr_dense.getRowPointer()).should.be.true;
    	})

		it('should contain proper colIndices array [0, 4, 1, 4, 2, 3]', function(){
			arrayEqualsV8([0, 4, 1, 4, 2, 3], csr_dense.getColumnIndices()).should.be.true;
    	})

		it('should contain proper data array [1, 1, 1, 1, 1, 1]', function(){
			arrayEqualsV8([1, 1, 1, 1, 1, 1], csr_dense.getData()).should.be.true;
    	})    	
  	})

  	describe('#getRowPointer(true)', function(){
  		it('should return a Uint32Array', function() {
  			var ui32array = csr_dense.getRowPointer(true);
  			(ui32array instanceof Uint32Array).should.be.true;
  		})

  		it('should return a Uint32Array with the same length of getRowPointer(false)', function() {
  			// var ui32array = csr_dense.getRowPointer(true);
  			// ui32array.should.have.length(csr_dense.getRowPointer().length);
  		})

  		it('should return a Uint32Array with the same content of getRowPointer(false)', function() {
  			var ui32array = csr_dense.getRowPointer(true);
  			csr_dense.getRowPointer().every(function(item,idx) { return (item == ui32array[idx]); }).should.be.true;
  		})  		
  	})

  	describe('#getColumnIndices(true)', function(){
  		it('should return a Uint32Array', function() {
  			var ui32array = csr_dense.getColumnIndices(true);
  			(ui32array instanceof Uint32Array).should.be.true;
  		})

  		it('should return a Uint32Array with the same length of getColumnIndices(false)', function() {
  			var ui32array = csr_dense.getColumnIndices(true);
  			ui32array.should.have.length(csr_dense.getColumnIndices().length);
  		})

  		it('should return a Uint32Array with the same content of getColumnIndices(false)', function() {
  			var ui32array = csr_dense.getColumnIndices(true);
  			csr_dense.getColumnIndices().every(function(item,idx) { return (item == ui32array[idx]); }).should.be.true;
  		}) 
  	})

  	describe('#getData(true)', function(){
  		it('should return a Float32Array', function() {
  			var float32array = csr_dense.getData(true);
  			(float32array instanceof Float32Array).should.be.true;
  		})

  		it('should return a Float32Array with the same length of getData(false)', function() {
  			var float32array = csr_dense.getData(true);
  			float32array.should.have.length(csr_dense.getData().length);
  		})

  		it('should return a Float32Array with the same content of getData(false)', function() {
  			var float32array = csr_dense.getData(true);
  			csr_dense.getData().every(function(item,idx) { return (item == float32array[idx]); }).should.be.true;
  		})
  	})
  	
  	describe('#toDense()', function(){
		it('should return an Array of Array that represents a dense matrix', function() {
			var denseMatrix = csr_dense.toDense();
			denseMatrix.should.have.length(csr_dense.getRowCount());

			arrayEqualsV8(dense, arrayFlatten( denseMatrix )).should.be.true;
		})

		it('should return an Array of Array that represents a dense matrix (random binary matrix)', function() {
			var columnLen = 10;
			var dense = f_generateBinaryMatrix(5,columnLen);
			var mat = new csr_matrix({"fromdense": dense, "numcols": columnLen});

			arrayEqualsV8(dense, arrayFlatten( mat.toDense() )).should.be.true;
		})		
  	})

  	describe('#transpose()', function(){
		it('should return a new properly transposed csr_matrix', function() {
			var transposedDense = csr_dense.transpose();

			transposedDense.getRowCount().should.equal(csr_denseT.getRowCount());
			transposedDense.getColCount().should.equal(csr_denseT.getColCount());

			arrayEqualsV8(transposedDense.getRowPointer(), csr_denseT.getRowPointer()).should.be.true;
			arrayEqualsV8(transposedDense.getColumnIndices(), csr_denseT.getColumnIndices()).should.be.true;
			arrayEqualsV8(transposedDense.getData(), csr_denseT.getData()).should.be.true;
		})

		it('should return a the same csr_matrix if applied two times', function() {
			var transposedDense = csr_dense.transpose().transpose();

			transposedDense.getRowCount().should.equal(csr_dense.getRowCount());
			transposedDense.getColCount().should.equal(csr_dense.getColCount());

			arrayEqualsV8(transposedDense.getRowPointer(), csr_dense.getRowPointer()).should.be.true;
			arrayEqualsV8(transposedDense.getColumnIndices(), csr_dense.getColumnIndices()).should.be.true;
			arrayEqualsV8(transposedDense.getData(), csr_dense.getData()).should.be.true;
		})		
  	})

  	describe('#multiply(csr_matrix)', function(){
		it('should return a new csr_matrix that is the result of multiplication of current with argument', function() {
			var mulResult = csr_dense.multiply(csr_denseT);

			// Size
			mulResult.getRowCount().should.equal(csr_dense.getRowCount());
			mulResult.getColCount().should.equal(csr_denseT.getColCount());

			// Content
			arrayEqualsV8(arrayFlatten(mulResult.toDense()), ddTMultiply).should.be.true;
		})
  	})
})
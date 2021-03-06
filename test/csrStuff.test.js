require("../array.prototype.js");
var f_generateBinaryMatrix = require("../matrixGenerator.js").generateBinaryMatrix;
var csr_matrix = require("../csrStuff.js").csr_matrix;

var should = require('should');
var log = console.log;

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

	// For multiplication a different matrix. To show bugs.
	var denseTwo = [1,0,0,1,
					0,1,0,0,
					0,0,0,1,
					0,0,0,1,
					1,1,0,1];

	var ddTMultiply = [2,1,0,2,
						0,1,0,0,
						1,1,0,1,
						0,0,0,2];

	var csr_dense, csr_denseT, csr_denseTwo, csr_multiply;

	before(function(){
		csr_dense = new csr_matrix({"fromdense": dense, "numcols": 5});
		csr_denseT = new csr_matrix({"fromdense": denseT, "numcols": 4});
		csr_denseTwo = new csr_matrix({"fromdense": denseTwo, "numcols": 4});
		csr_multiply = new csr_matrix({"fromdense": ddTMultiply, "numcols": 4});
	});

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
			[0, 2, 3, 4, 6].equalsV8(csr_dense.getRowPointer()).should.be.true;
		});

		it('should contain proper colIndices array [0, 4, 1, 4, 2, 3]', function(){
			[0, 4, 1, 4, 2, 3].equalsV8(csr_dense.getColumnIndices()).should.be.true;
		});

		it('should contain proper data array [1, 1, 1, 1, 1, 1]', function(){
			[1, 1, 1, 1, 1, 1].equalsV8(csr_dense.getData()).should.be.true;
		});
	});

	describe('#isDataInteger()', function(){
		it('should return true if data array contains only integers', function() {
			csr_dense.isDataInteger().should.be.true;
		});
	});

	describe('#isDataUinteger()', function(){
		it('should return true if data array contains only unsigned integers', function() {
			csr_dense.isDataUinteger().should.be.true;
		});
	});	

	describe('#isBinary()', function(){
		it('should return true if data array contains only 1', function() {
			csr_dense.isBinary().should.be.true;
		});
	});

	describe('#getRowPointer(true)', function(){
		it('should return a Uint32Array', function() {
			var ui32array = csr_dense.getRowPointer(true);
			(ui32array instanceof Uint32Array).should.be.true;
		});

		it('should return a Uint32Array with the same length of getRowPointer(false)', function() {
			var ui32array = csr_dense.getRowPointer(true);
			ui32array.should.have.length(csr_dense.getRowPointer().length);
		});

		it('should return a Uint32Array with the same content of getRowPointer(false)', function() {
			var ui32array = csr_dense.getRowPointer(true);
			csr_dense.getRowPointer().every(function(item,idx) { return (item === ui32array[idx]); }).should.be.true;
		});
	});

	describe('#getColumnIndices(true)', function(){
		it('should return a Uint32Array', function() {
			var ui32array = csr_dense.getColumnIndices(true);
			(ui32array instanceof Uint32Array).should.be.true;
		});

		it('should return a Uint32Array with the same length of getColumnIndices(false)', function() {
			var ui32array = csr_dense.getColumnIndices(true);
			ui32array.should.have.length(csr_dense.getColumnIndices().length);
		});

		it('should return a Uint32Array with the same content of getColumnIndices(false)', function() {
			var ui32array = csr_dense.getColumnIndices(true);
			csr_dense.getColumnIndices().every(function(item,idx) { return (item === ui32array[idx]); }).should.be.true;
		});
	});

	describe('#getData(true)', function(){
		it('should return a Float32Array', function() {
			var float32array = csr_dense.getData(true);
			(float32array instanceof Float32Array).should.be.true;
		});

		it('should return a Float32Array with the same length of getData(false)', function() {
			var float32array = csr_dense.getData(true);
			float32array.should.have.length(csr_dense.getData().length);
		});

		it('should return a Float32Array with the same content of getData(false)', function() {
			var float32array = csr_dense.getData(true);
			csr_dense.getData().every(function(item,idx) { return (item === float32array[idx]); }).should.be.true;
		});
	});
	
	describe('#getData(true, true)', function(){
		it('should return a Uint32Array', function() {
			var ui32array = csr_dense.getData(true, true);
			(ui32array instanceof Uint32Array).should.be.true;
		});

		it('should return a Uint32Array with the same length of getData(false)', function() {
			var ui32array = csr_dense.getData(true, true);
			ui32array.should.have.length(csr_dense.getData().length);
		});

		it('should return a Uint32Array with the same content of getData(false)', function() {
			var ui32array = csr_dense.getData(true, true);
			csr_dense.getData().every(function(item,idx) { return (item === ui32array[idx]); }).should.be.true;
		});
	});	

	describe('#toDense()', function(){
		it('should return an Array of Array that represents a dense matrix', function() {
			var denseMatrix = csr_dense.toDense();
			denseMatrix.should.have.length(csr_dense.getRowCount());

			dense.equalsV8( denseMatrix.flatten() ).should.be.true;
		});

		it('should return an Array of Array that represents a dense matrix (random binary matrix)', function() {
			var columnLen = 10;
			var dense = f_generateBinaryMatrix(5,columnLen);
			var mat = new csr_matrix({"fromdense": dense, "numcols": columnLen});

			dense.equalsV8( mat.toDense().flatten() ).should.be.true;
		});
	});

	describe('#equals(object)', function(){
		it('should return false if argument is null', function() {
			csr_dense.equals( null ).should.be.false;
		});

		it('should return false if argument is not of type "csr_matrix"', function() {
			csr_dense.equals( new Object() ).should.be.false;
		});

		it('should return true if argument is self', function() {
			csr_dense.equals( csr_dense ).should.be.true;
		});

		it('should return true if argument is another csr_matrix with same content', function() {
			csr_dense.equals( new csr_matrix({"fromdense": dense, "numcols": 5}) ).should.be.true;
		});

		it('should return false if argument is not self or not same content', function() {
			csr_dense.equals( csr_denseT ).should.be.false;
		});
	});

	describe('#copy()', function(){
		it('should return a copy of the matrix', function() {
			csr_dense.equals( csr_dense.copy() ).should.be.true;
		});
	});	

	describe('#transpose()', function(){
		it('should return a new properly transposed csr_matrix', function() {
			var transposedDense = csr_dense.transpose();

			transposedDense.equals(csr_denseT).should.be.true;
		});

		it('should return a the same csr_matrix if applied two times', function() {
			var transposedDense = csr_dense.transpose().transpose();

			transposedDense.equals(csr_dense).should.be.true;
		});
	});

	describe('#multiply(csr_matrix)', function(){
		it('should throw if input sizes are not correct for the current multiplication', function() {
			(function() { csr_dense.multiply(csr_dense); }).should.throw;
		});

		it('should return a new csr_matrix that is the result of multiplication of current with argument', function() {
			var mulResult = csr_dense.multiply(csr_denseTwo);

			mulResult.equals(csr_multiply).should.be.true;
		});
	});
});
require("../array.prototype.js");
var f_generateBinaryMatrix = require("../matrixGenerator.js").generateBinaryMatrix;

var should = require('should');
var log = console.log;

describe('sparseMatrixGenerator', function(){
	describe('#(20,20)', function(){
		it('should return 20x20 array', function(){
			f_generateBinaryMatrix(20,20).should.have.length(20*20);
		});
	});

	describe('#(20,20)', function(){
		it('should contain only 0 and 1', function(){
			f_generateBinaryMatrix(20,20).every( function(e){ return ((e === 0) || (e === 1));} ).should.be.true;
		});
	});

	describe('#(20,20,5)', function(){
		it('should have at maximum 5 non zero elements per row', function(){
			var nnz = 5;
			f_generateBinaryMatrix(20,20,nnz).chunk(20).every( function(arr) {
				return ( arr.filter(function(e) { return (e !== 0); } ).length <= nnz );
			}).should.be.true;
		});
	});
});
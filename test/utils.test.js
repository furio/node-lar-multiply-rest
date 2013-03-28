var f_utils = require("../utils.js");
var should = require('should');

describe('utils', function(){
	describe('#isUnsignedInteger()', function(){
		it('should return false', function(){
			f_utils.isUnsignedInteger().should.be.false;
		});
	});
	
	describe('#isUnsignedInteger(null)', function(){
		it('should return false', function(){
			f_utils.isUnsignedInteger(null).should.be.false;
		});
	});

	describe('#isUnsignedInteger(0)', function(){
		it('should return true', function(){
			f_utils.isUnsignedInteger(0).should.be.true;
		});
	});
	
	describe('#isUnsignedInteger(20)', function(){
		it('should return true', function(){
			f_utils.isUnsignedInteger(20).should.be.true;
		});
	});
	
	describe('#isUnsignedInteger(-20)', function(){
		it('should return false', function(){
			f_utils.isUnsignedInteger(-20).should.be.false;
		});
	});	

	describe('#isUnsignedInteger("aa")', function(){
		it('should return false', function(){
			f_utils.isUnsignedInteger("aa").should.be.false;
		});
	});
});
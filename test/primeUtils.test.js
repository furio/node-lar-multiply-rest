require("../array.prototype.js");
var primeUtils = require("../primeUtils.js");

var should = require('should');
var log = console.log;

describe('primeUtils', function(){

	var primeNumbers = [2,3,5,7,11,13,17,19,23,
						29,31,37,41,43,47,53,59,61,67,
						71,73,79,83,89,97,101,103,107,109,
						113,127,131,137,139,149,151,157,163,167,
						173,179,181,191,193,197,199,211,223,227,
						229,233,239,241,251,257,263,269,271,277,
						281,283,293,307,311,313,317,331,337,347,
						349,353,359,367,373,379,383,389,397,401,
						409,419,421,431,433,439,443,449,457,461,
						463,467,479,487,491,499,503,509,521,523,
						541,547,557,563,569,571,577,587,593,599,
						601,607,613,617,619,631,641,643,647,653,
						659,661,673,677,683,691,701,709,719,727,
						733,739,743,751,757,761,769,773,787,797,
						809,811,821,823,827,829,839,853,857,859,
						863,877,881,883,887,907,911,919,929,937,
						941,947,953,967,971,977,983,991,997];

	var divisors = [[2, [1, 2]],
					[3, [1, 3]],
					[4, [1, 2, 4]],
					[5, [1, 5]],
					[6, [1, 2, 3, 6]],
					[7, [1, 7]],
					[8, [1, 2, 4, 8]],
					[9, [1, 3, 9]],
					[10, [1, 2, 5, 10]],
					// Random from wiki
					[59, [1, 59]],
					[77, [1, 7, 11, 77]],
					[96, [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 96]],
					[220, [1, 2, 4, 5, 10, 11, 20, 22, 44, 55, 110, 220]],
					[360, [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180, 360]]
				];

	describe('#isPrime(arg)', function(){
		it('should return false if argument is 0', function(){
			primeUtils.isPrime(0).should.be.false;
		});

		it('should return false if argument is 1', function(){
			primeUtils.isPrime(1).should.be.false;
		});

		it('should return true for every number in the "primeNumbers" array', function(){
			primeNumbers.every(function(e) { return primeUtils.isPrime(e); } ).should.be.true;
		});
	});

	describe('#listDivisors(arg)', function(){
		it('should throw if argument is less than 1', function(){
			(function() { primeUtils.listDivisors(0); }).should.throw();
		});

		it('should return an array of divisor if argument is greater or equal to 1', function(){
			(primeUtils.listDivisors(1) instanceof Array).should.be.equal(true);
		});

		it('should return the correct divisos sequence for the "divisors" array', function(){
			divisors.map( function(e) { return primeUtils.listDivisors(e[0]).equalsV8(e[1]); } )
					.every( function(e) { return e; } ).should.be.true;
		});
	});
});
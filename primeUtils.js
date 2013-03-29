var listDivisors = function(n) {
	if (n < 1) {
		throw new Error("Argument error");
	}

	var small = [];
	var large = [];
	var end = Math.floor(Math.sqrt(n));
	for (var i = 1; i <= end; i++) {
		if (n % i === 0) {
			small.push(i);
			if (i * i != n) {  // Don't include a square root twice
				large.push(n / i);
			}
		}
	}

	large.reverse();
	return small.concat(large);
};

// leastFactor, isPrime
// Copyright (c) 2011 Alexei Kourbatov

var leastFactor = function(n) {
	if (isNaN(n) || !isFinite(n)) { return NaN; }
	if (n === 0) { return 0; }
	if (n%1 || n*n<2) { return 1; }
	if ( (n%2) === 0) { return 2; }
	if ( (n%3) === 0) { return 3; }
	if ( (n%5) === 0) { return 5; }

	var m = Math.sqrt(n);
	for (var i=7; i<=m; i+=30) {
		if ((n%i)===0)      { return i; }
		if ((n%(i+4))===0)  { return i+4; }
		if ((n%(i+6))===0)  { return i+6; }
		if ((n%(i+10))===0) { return i+10; }
		if ((n%(i+12))===0) { return i+12; }
		if ((n%(i+16))===0) { return i+16; }
		if ((n%(i+22))===0) { return i+22; }
		if ((n%(i+24))===0) { return i+24; }
	}

	return n;
};

var isPrime = function(n) {
	if (isNaN(n) || !isFinite(n) || n%1 || n<2) { return false; }
	if (n == leastFactor(n)) { return true; }
	return false;
};

exports.isPrime = isPrime;
exports.listDivisors = listDivisors;
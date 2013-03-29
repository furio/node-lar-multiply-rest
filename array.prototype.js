if ( !Array.prototype.chunk ) {
	Object.defineProperty(Array.prototype, 'chunk', {
		value: function(chunkSize) {
			var array = this;
			return [].concat.apply([], array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
			);
		}
	});
}

if ( !Array.prototype.equalsV8 ) {
	Object.defineProperty(Array.prototype, 'equalsV8', {
		value: function(otherArray) {
			return !(this<otherArray || otherArray<this);
		}
	});
}

if ( !Array.prototype.flatten ) {
	Object.defineProperty(Array.prototype, 'flatten', {
		value: function() {
			return this.reduce(function(a, b) { return a.concat(b); });
		}
	});
}

if ( !Array.prototype.unique ) {
	Object.defineProperty(Array.prototype, 'unique', {
		value: function() {
			var o = {}, i, l = this.length, r = [];
			for(i=0; i<l;i+=1) { o[this[i]] = this[i]; }
			for(i in o) { r.push(o[i]); }
			return r;
		}
	});
}
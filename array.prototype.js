Array.prototype.chunk = function(chunkSize) {
    var array=this;
    return [].concat.apply([],
        array.map(function(elem,i) {
            return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
    );
};

Array.prototype.equalsV8 = function(otherArray) {
    return !(this<otherArray || otherArray<this);
};

Array.prototype.flatten = function() {
    return this.reduce(function(a, b) { return a.concat(b); });
};

Array.prototype.unique = function() {
	var o = {}, i, l = this.length, r = [];
	for(i=0; i<l;i+=1) o[this[i]] = this[i];
	for(i in o) r.push(o[i]);
	return r;
};
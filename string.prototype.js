if ( !String.prototype.startsWith  ) {
	Object.defineProperty(String.prototype, 'startsWith', {
		value: function(str) {
			return ( this.slice(0, str.length) == str );
		}
	});
}

if ( !String.prototype.endsWith  ) {
	Object.defineProperty(String.prototype, 'endsWith', {
		value: function(str) {
			return ( this.slice(-str.length) == str );
		}
	});
}
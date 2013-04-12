require("../array.prototype.js");
var WebCLArrayContainer = require("./WebCLArrayContainer.js").WebCLArrayContainer;

var V8ArrayBufferMaxLength = 0x3fffffff;
var startPower = Math.pow(2,28);

var newFilledArray = function(len, val) {
    var a = new Array(len);
    while(len--){
	// console.log(len);
        a[len] = val;
    }
    return a;
};

var newFilledArray2 = function(len) {
    var a = new Array(len);
    for(var i = 0; i < len; i++) {
        a[i] = i;
    }
    return a;
};

var newFilledArray3 = function(len) {
    var a = {};
    for(var i = 0; i < len; i++) {
        a[i] = i;
    }
    return a;
};

console.log("Init test array");
var jsArray = null;
for(var i = 0; i < 2; i++) {
 startPower = startPower * Math.pow(2,i);
 console.log("Power: " + startPower);
 jsArray = newFilledArray3(startPower, 1);
}

require("../array.prototype.js");
var WebCLArrayContainer = require("./WebCLArrayContainer.js").WebCLArrayContainer;

var V8ArrayBufferMaxLength = 0x3fffffff;

var newFilledArray = function(len, val) {
    var a = [];
    while(len--){
        a.push(val);
    }
    return a;
};

console.log("Init wrapper");
var bigArray = new WebCLArrayContainer(Int32Array, V8ArrayBufferMaxLength - 1);

console.log("Init test array");
var jsArray = newFilledArray(V8ArrayBufferMaxLength - 1, 1);

console.log("From js to wrapper");
bigArray.fromJsArray(jsArray);

console.log("Test output");
console.log( bigArray.getArrayLength() );
console.log( bigArray.get(150000) );

console.log("From wrapper to js");
var jsBack = bigArray.toJsArray();
console.log( jsBack.length );
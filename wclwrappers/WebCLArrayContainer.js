/*

WebCLArrayContainer(typedArray, length)
|
|
+ - STATIC::kMaxLength (from js engine)
|
+ - length
|
+ - kMaxLength/length typedArray in object map
|
+ - get() / set()
|
+ - readFromWebCLBuffer(queue, CLbuffer, startOffset, size) async or sync or events?
|
+ - writeToWebClBuffer(queue, CLbuffer, startOffset, size) async or sync or events?
|
+ - fromJSArray(jsArray, destinationType)
*/
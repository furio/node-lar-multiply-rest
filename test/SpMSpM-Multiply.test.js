require("../array.prototype.js");
f_generateBinaryMatrix = require("../matrixGenerator.js").generateBinaryMatrix;
csr_matrix = require("../csrStuff.js").csr_matrix;

should = require('should');
log = console.log;

describe('SpMSpM-Multiply', function(){
  var dense = [1,0,0,0,1,
         0,1,0,0,0,
         0,0,0,0,1,
         0,0,1,1,0];

  var denseT = [1,0,0,1,
          0,1,0,0,
          0,0,0,1,
          0,0,0,1,
          1,1,0,1];

  var ddTMultiply = [2,1,0,2,
             0,1,0,0,
             1,1,0,1,
             0,0,0,2];

  var csr_dense, csr_denseT, csr_multiply, g_webcl; 

  before(function(){
    csr_dense = new csr_matrix({"fromdense": dense, "numcols": 5});
    csr_denseT = new csr_matrix({"fromdense": denseT, "numcols": 4});
    csr_multiply = new csr_matrix({"fromdense": ddTMultiply, "numcols": 4});

    // this will fail and stop this test suite, if node-webcl is not present
    g_webcl = require("../SpMSpM-Multiply.js");
  })

  describe('multiplyMatrix(csr_dense,csr_denseT)', function(){
    it('should return a csr matrix equal to csr_multiply', function(){
      var csr_result = g_webcl.multiplyMatrix(csr_dense, csr_denseT);

      //
      csr_result.getRowPointer().equalsV8(csr_multiply.getRowPointer()).should.be.true;
      csr_result.getColumnIndices().equalsV8(csr_multiply.getColumnIndices()).should.be.true;
      csr_result.getData().equalsV8(csr_multiply.getData()).should.be.true;
    });     
  })

  describe('multiplyMatrix(randomMatrix,randomMatrix)', function(){
    it('should return a csr matrix with correct content', function(){
      // Keep it low JS verification algorithm is slower
      var m = 4;
      var p = 5;
      var n = 6;
      var randomDense1 = f_generateBinaryMatrix(m,p);
      var randomDense2 = f_generateBinaryMatrix(p,n);
/*
      var csr_randomDense1 = new csr_matrix({"fromdense": randomDense1, "numcols": p});
      var csr_randomDense2 = new csr_matrix({"fromdense": randomDense2, "numcols": n});      

      var csr_randomResult = g_webcl.multiplyMatrix(csr_randomDense1, csr_randomDense2);
      var csr_randomResult_Verify = csr_randomDense1.multiply( csr_randomDense2 );

      log(csr_randomDense1.toDense())
      log(csr_randomDense2.toDense())
      log(csr_randomResult.toDense())
      log(csr_randomResult_Verify.toDense())
      log(csr_randomResult.toString())
      log(csr_randomResult_Verify.toString())

      //
      csr_randomResult.getRowPointer().equalsV8(csr_randomResult_Verify.getRowPointer()).should.be.true;
      csr_randomResult.getColumnIndices().equalsV8(csr_randomResult_Verify.getColumnIndices()).should.be.true;
      csr_randomResult.getData().equalsV8(csr_randomResult_Verify.getData()).should.be.true;
*/
    });     
  })  
})
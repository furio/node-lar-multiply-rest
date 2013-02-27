// To be replaced before kernel compiling
#define MAXROW %%AROW%%
#define MAXCOL %%BCOL%%
#define AGGRO_SIZE %%AGGROSIZE%%

__kernel void spmm_kernel_naive(
	__global const uint * restrict ArowPtr, __global const uint * restrict Acols,
	__global const float * restrict Adata,
	__global const uint * restrict BrowPtr, __global const uint * restrict Bcols,
	// va' cambiato in un array di maxrow*aggro_size*uint3 == x * y * 12 bytes
	__global const float * restrict Bdata,
    __global float * denseVal) 
{
	int currRow = get_global_id(0);
	int currCol = get_global_id(1);

	if( !(currRow < MAXROW) && (currCol < MAXCOL) )
	{
		return;
	}
	
	__local uint3 aggroStructure[AGGRO_SIZE];

	int ArowCur = ArowPtr[currRow];
	int ArowEnd = ArowPtr[currRow+1];
	
	int BrowCur = BrowPtr[currCol];
	int BrowEnd = BrowPtr[currCol+1];
	
	int AcurIdx = -1;
	int BcurIdx = -1;

	float localSum = 0;

	while ((ArowCur < ArowEnd) && (BrowCur < BrowEnd)) {

		AcurIdx = Acols[ArowCur];
		BcurIdx = Bcols[BrowCur];

		if (AcurIdx == BcurIdx) {
			localSum += Adata[ArowCur] * Bdata[BrowCur];
			ArowCur++;
			BrowCur++;
		} else if ( AcurIdx < BcurIdx) {
			ArowCur++;
		} else {
			BrowCur++;
		}
	}

	denseVal[currRow*MAXCOL + currCol] = localSum;
}
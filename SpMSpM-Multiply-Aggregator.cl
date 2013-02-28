// To be replaced before kernel compiling
#define MAXROW %%AROW%%
#define MAXCOL %%BCOL%%
#define AGGRO_SIZE %%AGGROSIZE%%
#define AGGRO_ARRAY_SIZE (AGGRO_SIZE * MAXROW)

/*
Idea create a local workSpace.Row * worSpace.Col * float2 ??? row*col < max_local ... max_local*float < local_size???
	scrivo con getlocalid(0/1)

	array globale è AGGREGATION_CASO_PEGGIORE*float2*MAXROW < MAXROW*MAXCOL
	barrier(LOCAL)
	if thread = 0
	scrivi nella mia porzione d'array che e' get_global_id(0) * 128 le coppie (col, valore)
*/


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
	
	__local float2 aggroStructure[AGGRO_ARRAY_SIZE];

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
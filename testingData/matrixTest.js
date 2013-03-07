var log = console.log,
	csr_matrix = require('../csrStuff.js').csr_matrix;

var mat1 = new csr_matrix({
	"numcols": 176,
	"rowptr": [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 170, 172, 174, 176, 178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212, 214, 216, 218, 220, 222, 224, 226, 228, 230, 232, 234, 236, 238, 240, 242, 244, 246, 248, 250, 252, 254, 256, 258, 260, 262, 264, 266, 268, 270, 272, 274, 276, 278, 280, 282, 284, 286, 288, 290, 292, 294, 296, 298, 300, 302, 304, 306, 308, 310, 312, 314, 316, 318, 320, 322, 324, 326, 328, 330, 332, 334, 336, 338, 340, 342, 344, 346, 348, 350, 352, 354, 356, 358, 360, 362, 364, 366, 368, 370, 372, 374, 376, 378, 380, 382, 384, 386, 388, 390, 392, 394, 396, 398, 400, 402, 404, 406, 408, 410, 412, 414, 416, 418, 420, 422, 424, 426, 428, 430, 432, 434, 436, 438, 440, 442, 444, 446, 448, 450, 452, 454, 456, 458, 460, 462, 464, 466, 468, 470, 472, 474, 476, 478, 480, 482, 484, 486, 488, 490, 492, 494, 496, 498, 500, 502, 504, 506, 508, 510, 512, 514, 516, 518, 520, 522, 524],
	"colindices": [0, 1, 0, 14, 0, 162, 1, 2, 1, 102, 2, 3, 2, 79, 3, 4, 3, 78, 4, 5, 4, 96, 5, 6, 5, 168, 6, 7, 6, 167, 7, 8, 7, 70, 8, 9, 8, 15, 9, 10, 9, 25, 10, 11, 10, 69, 11, 12, 11, 81, 12, 13, 12, 163, 13, 14, 13, 95, 14, 94, 15, 16, 15, 71, 16, 17, 16, 93, 17, 18, 17, 91, 18, 19, 18, 72, 19, 20, 19, 55, 20, 21, 20, 26, 21, 22, 21, 41, 22, 23, 22, 83, 23, 24, 23, 150, 24, 25, 24, 90, 25, 66, 26, 27, 26, 58, 27, 28, 27, 50, 28, 29, 28, 49, 29, 30, 29, 54, 30, 31, 30, 85, 31, 32, 31, 101, 32, 33, 32, 108, 33, 34, 33, 171, 34, 35, 34, 99, 35, 36, 35, 64, 36, 37, 36, 60, 37, 38, 37, 63, 38, 39, 38, 98, 39, 40, 39, 107, 40, 41, 40, 169, 41, 82, 42, 43, 42, 52, 42, 152, 43, 44, 43, 121, 44, 45, 44, 119, 45, 46, 45, 112, 46, 47, 46, 122, 47, 48, 47, 88, 48, 49, 48, 89, 49, 53, 50, 51, 50, 59, 51, 52, 51, 87, 52, 106, 53, 54, 53, 157, 54, 84, 55, 56, 55, 73, 56, 57, 56, 154, 57, 58, 57, 153, 58, 59, 59, 86, 60, 61, 60, 65, 61, 62, 61, 140, 62, 63, 62, 139, 63, 97, 64, 65, 64, 99, 65, 140, 66, 67, 66, 90, 67, 68, 67, 149, 68, 69, 68, 105, 69, 80, 70, 71, 70, 167, 71, 93, 72, 73, 72, 92, 73, 154, 74, 75, 74, 79, 74, 173, 75, 76, 75, 103, 76, 77, 76, 104, 77, 78, 77, 165, 78, 96, 79, 102, 80, 81, 80, 105, 81, 148, 82, 83, 82, 169, 83, 151, 84, 85, 84, 156, 85, 100, 86, 87, 86, 153, 87, 106, 88, 89, 88, 158, 89, 157, 90, 149, 91, 92, 91, 133, 92, 132, 93, 133, 94, 95, 94, 162, 95, 163, 96, 168, 97, 98, 97, 172, 98, 107, 99, 171, 100, 101, 100, 170, 101, 108, 102, 173, 103, 104, 103, 166, 104, 165, 105, 148, 106, 153, 107, 172, 108, 170, 109, 110, 109, 112, 109, 124, 110, 111, 110, 175, 111, 112, 111, 122, 113, 114, 113, 116, 113, 130, 114, 115, 114, 129, 115, 116, 115, 124, 116, 123, 117, 118, 117, 120, 117, 174, 118, 119, 118, 123, 119, 120, 120, 121, 121, 174, 122, 175, 123, 130, 124, 129, 125, 126, 125, 135, 125, 160, 126, 127, 127, 128, 127, 143, 128, 129, 128, 158, 130, 131, 131, 132, 131, 152, 132, 154, 133, 134, 134, 135, 134, 167, 135, 164, 136, 137, 136, 145, 136, 146, 137, 138, 137, 151, 138, 139, 138, 169, 139, 172, 140, 141, 141, 142, 141, 171, 142, 143, 142, 155, 143, 144, 144, 145, 146, 147, 146, 159, 147, 148, 147, 163, 149, 150, 150, 151, 152, 174, 155, 156, 155, 170, 156, 157, 158, 175, 159, 160, 160, 161, 161, 162, 161, 166, 164, 165, 164, 168, 166, 173]
});

var mat2 = new csr_matrix({
	"numcols": 262,
	"rowptr": [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108, 111, 114, 117, 120, 123, 126, 129, 132, 135, 138, 141, 144, 147, 150, 153, 156, 159, 162, 165, 168, 171, 174, 177, 180, 183, 186, 189, 192, 195, 198, 201, 204, 207, 210, 213, 216, 219, 222, 225, 228, 231, 234, 237, 240, 243, 246, 249, 252, 255, 258, 261, 264, 267, 270, 273, 276, 279, 282, 285, 288, 291, 294, 297, 300, 303, 306, 309, 312, 315, 318, 321, 324, 327, 330, 333, 336, 339, 342, 345, 348, 351, 354, 357, 360, 363, 366, 369, 372, 375, 378, 380, 383, 386, 389, 392, 395, 398, 401, 404, 407, 410, 413, 416, 419, 422, 425, 428, 431, 433, 435, 438, 441, 444, 447, 450, 453, 456, 459, 462, 465, 468, 471, 474, 476, 479, 482, 485, 488, 491, 494, 497, 500, 503, 506, 509, 512, 515, 518, 521, 524],
	"colindices": [0, 1, 2, 0, 3, 4, 3, 5, 6, 5, 7, 8, 7, 9, 10, 9, 11, 12, 11, 13, 14, 13, 15, 16, 15, 17, 18, 17, 19, 20, 19, 21, 22, 21, 23, 24, 23, 25, 26, 25, 27, 28, 1, 27, 29, 18, 30, 31, 30, 32, 33, 32, 34, 35, 34, 36, 37, 36, 38, 39, 38, 40, 41, 40, 42, 43, 42, 44, 45, 44, 46, 47, 46, 48, 49, 20, 48, 50, 41, 51, 52, 51, 53, 54, 53, 55, 56, 55, 57, 58, 57, 59, 60, 59, 61, 62, 61, 63, 64, 63, 65, 66, 65, 67, 68, 67, 69, 70, 69, 71, 72, 71, 73, 74, 73, 75, 76, 75, 77, 78, 77, 79, 80, 43, 79, 81, 82, 83, 84, 82, 85, 86, 85, 87, 88, 87, 89, 90, 89, 91, 92, 91, 93, 94, 93, 95, 96, 56, 95, 97, 54, 98, 99, 98, 100, 101, 83, 100, 102, 97, 103, 104, 58, 103, 105, 39, 106, 107, 106, 108, 109, 108, 110, 111, 52, 110, 112, 99, 112, 113, 72, 114, 115, 114, 116, 117, 116, 118, 119, 74, 118, 120, 70, 121, 122, 115, 121, 123, 50, 124, 125, 124, 126, 127, 126, 128, 129, 22, 128, 130, 16, 131, 132, 31, 131, 133, 37, 134, 135, 107, 134, 136, 137, 138, 139, 137, 140, 141, 140, 142, 143, 142, 144, 145, 8, 144, 146, 6, 138, 147, 130, 148, 149, 24, 148, 150, 81, 151, 152, 45, 151, 153, 105, 154, 155, 60, 154, 156, 113, 157, 158, 101, 157, 159, 94, 160, 161, 96, 160, 162, 49, 125, 163, 35, 164, 165, 135, 164, 166, 33, 133, 167, 29, 168, 169, 28, 168, 170, 10, 146, 171, 120, 172, 173, 76, 172, 174, 68, 122, 175, 156, 176, 177, 62, 176, 178, 4, 147, 179, 141, 180, 181, 143, 180, 182, 129, 149, 183, 102, 159, 184, 78, 174, 185, 64, 178, 186, 187, 188, 189, 187, 190, 191, 190, 192, 193, 90, 188, 192, 194, 195, 196, 194, 197, 198, 197, 199, 200, 195, 199, 201, 202, 203, 204, 202, 205, 206, 88, 205, 207, 203, 207, 208, 86, 208, 209, 92, 193, 210, 201, 206, 211, 189, 200, 212, 213, 214, 215, 213, 216, 216, 217, 218, 217, 219, 220, 198, 212, 219, 196, 211, 221, 221, 222, 223, 166, 222, 224, 165, 167, 225, 225, 226, 227, 214, 226, 228, 229, 230, 231, 229, 232, 233, 232, 234, 235, 119, 234, 236, 117, 123, 237, 237, 238, 239, 238, 240, 241, 218, 240, 242, 242, 243, 230, 243, 231, 244, 245, 244, 246, 247, 150, 183, 246, 127, 163, 248, 47, 248, 249, 153, 233, 249, 84, 223, 250, 111, 158, 184, 109, 136, 224, 241, 251, 252, 155, 251, 253, 104, 162, 253, 161, 220, 254, 245, 255, 215, 255, 256, 256, 257, 258, 2, 169, 257, 26, 170, 247, 228, 259, 260, 145, 182, 259, 181, 258, 261, 14, 132, 227, 12, 171, 260, 80, 152, 235, 177, 186, 252, 66, 175, 239, 173, 185, 236, 139, 179, 261, 204, 209, 250, 191, 210, 254]
});

var matR = new csr_matrix({
	"numcols": 262,
	"rowptr": [0, 5, 7, 9, 10, 12, 15, 18, 22, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 92, 97, 102, 107, 112, 117, 121, 126, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 191, 196, 203, 210, 216, 222, 227, 233, 239, 244, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 301, 306, 312, 317, 323, 328, 334, 339, 344, 349, 354, 359, 364, 369, 374, 380, 385, 392, 398, 405, 412, 418, 423, 428, 433, 438, 443, 448, 453, 458, 463, 468, 473, 478, 483, 488, 493, 498, 503, 508, 513, 518, 523, 528, 533, 538, 543, 548, 553, 558, 563, 568, 573, 578, 583, 588, 593, 598, 603, 608, 613, 618, 623, 628, 634, 640, 645, 650, 655, 660, 665, 670, 675, 680, 685, 690, 695, 700, 705, 710, 715, 720, 725, 730, 735, 740, 744, 749, 754, 759, 764, 770, 776, 782, 788, 793, 799, 804, 809, 814, 819, 824, 829, 834, 839, 844, 849, 854, 858, 863, 868, 873, 878, 883, 889, 895, 901, 906, 911, 916, 921, 926, 931, 936, 941, 947, 953, 958, 963, 968, 973, 978, 983, 988, 993, 998, 1003, 1008, 1013, 1018, 1023, 1028, 1033, 1038, 1043, 1048, 1053, 1058, 1063, 1068, 1073, 1078, 1082, 1087, 1092, 1096, 1101, 1106, 1111, 1116, 1121, 1126, 1131, 1136, 1141, 1146, 1151, 1156, 1161, 1165, 1170, 1175, 1180, 1185, 1190, 1196, 1201, 1206, 1211, 1217, 1222, 1226, 1229, 1234, 1238, 1243, 1248, 1253, 1259, 1265, 1270, 1275, 1280, 1285, 1289, 1294, 1298, 1303, 1308, 1313, 1318],
	"colindices": [0, 1, 2, 3, 4, 27, 29, 169, 257, 6, 147, 179, 6, 7, 8, 6, 138, 147, 7, 8, 9, 10, 7, 8, 144, 146, 7, 9, 10, 11, 12, 7, 9, 10, 146, 171, 9, 11, 12, 13, 14, 9, 11, 12, 171, 260, 11, 13, 14, 15, 16, 11, 13, 14, 132, 227, 13, 15, 16, 17, 18, 13, 15, 16, 131, 132, 15, 17, 18, 19, 20, 15, 17, 18, 30, 31, 17, 19, 20, 21, 22, 17, 19, 20, 48, 50, 3, 19, 21, 22, 23, 24, 19, 21, 22, 128, 130, 21, 23, 24, 25, 26, 21, 23, 24, 148, 150, 23, 25, 26, 27, 28, 23, 25, 26, 170, 247, 25, 27, 28, 29, 25, 27, 28, 168, 170, 27, 29, 168, 169, 18, 30, 31, 32, 33, 18, 30, 31, 131, 133, 30, 32, 33, 34, 35, 30, 32, 33, 133, 167, 32, 34, 35, 36, 37, 32, 34, 35, 164, 165, 34, 36, 37, 38, 39, 34, 36, 37, 134, 135, 36, 38, 39, 40, 41, 36, 38, 39, 106, 107, 38, 40, 41, 42, 43, 1, 38, 40, 41, 51, 52, 40, 42, 43, 44, 45, 1, 2, 40, 42, 43, 79, 81, 1, 2, 42, 44, 45, 46, 47, 2, 42, 44, 45, 151, 153, 2, 44, 46, 47, 48, 49, 44, 46, 47, 248, 249, 2, 20, 46, 48, 49, 50, 3, 46, 48, 49, 125, 163, 20, 48, 50, 124, 125, 3, 41, 51, 52, 53, 54, 41, 51, 52, 110, 112, 51, 53, 54, 55, 56, 51, 53, 54, 98, 99, 53, 55, 56, 57, 58, 53, 55, 56, 95, 97, 55, 57, 58, 59, 60, 55, 57, 58, 103, 105, 57, 59, 60, 61, 62, 57, 59, 60, 154, 156, 3, 59, 61, 62, 63, 64, 59, 61, 62, 176, 178, 3, 61, 63, 64, 65, 66, 61, 63, 64, 178, 186, 3, 63, 65, 66, 67, 68, 63, 65, 66, 175, 239, 3, 65, 67, 68, 69, 70, 65, 67, 68, 122, 175, 67, 69, 70, 71, 72, 67, 69, 70, 121, 122, 69, 71, 72, 73, 74, 69, 71, 72, 114, 115, 71, 73, 74, 75, 76, 71, 73, 74, 118, 120, 73, 75, 76, 77, 78, 5, 73, 75, 76, 172, 174, 75, 77, 78, 79, 80, 4, 5, 75, 77, 78, 174, 185, 5, 43, 77, 79, 80, 81, 2, 4, 77, 79, 80, 152, 235, 4, 5, 43, 79, 81, 151, 152, 2, 82, 83, 84, 85, 86, 82, 83, 84, 100, 102, 82, 83, 84, 223, 250, 82, 85, 86, 87, 88, 82, 85, 86, 208, 209, 85, 87, 88, 89, 90, 85, 87, 88, 205, 207, 87, 89, 90, 91, 92, 87, 89, 90, 188, 192, 89, 91, 92, 93, 94, 89, 91, 92, 193, 210, 91, 93, 94, 95, 96, 91, 93, 94, 160, 161, 56, 93, 95, 96, 97, 93, 95, 96, 160, 162, 56, 95, 97, 103, 104, 54, 98, 99, 100, 101, 54, 98, 99, 112, 113, 83, 98, 100, 101, 102, 98, 100, 101, 157, 159, 83, 100, 102, 159, 184, 58, 97, 103, 104, 105, 97, 103, 104, 162, 253, 58, 103, 105, 154, 155, 39, 106, 107, 108, 109, 39, 106, 107, 134, 136, 106, 108, 109, 110, 111, 106, 108, 109, 136, 224, 52, 108, 110, 111, 112, 108, 110, 111, 158, 184, 52, 99, 110, 112, 113, 99, 112, 113, 157, 158, 72, 114, 115, 116, 117, 72, 114, 115, 121, 123, 114, 116, 117, 118, 119, 114, 116, 117, 123, 237, 74, 116, 118, 119, 120, 116, 118, 119, 234, 236, 74, 118, 120, 172, 173, 70, 115, 121, 122, 123, 68, 70, 121, 122, 175, 115, 117, 121, 123, 237, 50, 124, 125, 126, 127, 3, 49, 50, 124, 125, 163, 3, 124, 126, 127, 128, 129, 124, 126, 127, 163, 248, 22, 126, 128, 129, 130, 126, 128, 129, 149, 183, 22, 128, 130, 148, 149, 16, 31, 131, 132, 133, 14, 16, 131, 132, 227, 31, 33, 131, 133, 167, 37, 107, 134, 135, 136, 37, 134, 135, 164, 166, 107, 109, 134, 136, 224, 137, 138, 139, 140, 141, 6, 137, 138, 139, 147, 137, 138, 139, 179, 261, 137, 140, 141, 142, 143, 137, 140, 141, 180, 181, 140, 142, 143, 144, 145, 140, 142, 143, 180, 182, 8, 142, 144, 145, 146, 142, 144, 145, 182, 259, 8, 10, 144, 146, 171, 6, 138, 147, 179, 24, 130, 148, 149, 150, 129, 130, 148, 149, 183, 24, 148, 150, 183, 246, 45, 81, 151, 152, 153, 2, 80, 81, 151, 152, 235, 5, 45, 151, 153, 233, 249, 2, 60, 105, 154, 155, 156, 3, 105, 154, 155, 251, 253, 60, 154, 156, 176, 177, 3, 101, 113, 157, 158, 159, 111, 113, 157, 158, 184, 101, 102, 157, 159, 184, 94, 96, 160, 161, 162, 94, 160, 161, 220, 254, 96, 104, 160, 162, 253, 49, 125, 127, 163, 248, 35, 135, 164, 165, 166, 35, 164, 165, 167, 225, 135, 164, 166, 222, 224, 33, 133, 165, 167, 225, 28, 29, 168, 169, 170, 29, 168, 169, 257, 26, 28, 168, 170, 247, 10, 12, 146, 171, 260, 76, 120, 172, 173, 174, 120, 172, 173, 185, 236, 76, 78, 172, 174, 185, 5, 66, 68, 122, 175, 239, 3, 62, 156, 176, 177, 178, 3, 156, 176, 177, 186, 252, 62, 64, 176, 178, 186, 3, 139, 147, 179, 261, 141, 143, 180, 181, 182, 141, 180, 181, 258, 261, 143, 145, 180, 182, 259, 129, 149, 150, 183, 246, 102, 111, 158, 159, 184, 78, 173, 174, 185, 236, 5, 64, 177, 178, 186, 252, 3, 187, 188, 189, 190, 191, 90, 187, 188, 189, 192, 187, 188, 189, 200, 212, 187, 190, 191, 192, 193, 187, 190, 191, 210, 254, 90, 188, 190, 192, 193, 92, 190, 192, 193, 210, 194, 195, 196, 197, 198, 194, 195, 196, 199, 201, 194, 195, 196, 211, 221, 194, 197, 198, 199, 200, 194, 197, 198, 212, 219, 195, 197, 199, 200, 201, 189, 197, 199, 200, 212, 195, 199, 201, 206, 211, 202, 203, 204, 205, 206, 202, 203, 204, 207, 208, 202, 203, 204, 209, 250, 88, 202, 205, 206, 207, 201, 202, 205, 206, 211, 88, 203, 205, 207, 208, 86, 203, 207, 208, 209, 86, 204, 208, 209, 250, 92, 191, 193, 210, 254, 196, 201, 206, 211, 221, 189, 198, 200, 212, 219, 213, 214, 215, 216, 213, 214, 215, 226, 228, 213, 214, 215, 255, 256, 213, 216, 217, 218, 216, 217, 218, 219, 220, 216, 217, 218, 240, 242, 198, 212, 217, 219, 220, 161, 217, 219, 220, 254, 196, 211, 221, 222, 223, 166, 221, 222, 223, 224, 84, 221, 222, 223, 250, 109, 136, 166, 222, 224, 165, 167, 225, 226, 227, 214, 225, 226, 227, 228, 14, 132, 225, 226, 227, 214, 226, 228, 259, 260, 229, 230, 231, 232, 233, 229, 230, 231, 243, 229, 230, 231, 244, 245, 229, 232, 233, 234, 235, 153, 229, 232, 233, 249, 119, 232, 234, 235, 236, 80, 152, 232, 234, 235, 5, 119, 173, 185, 234, 236, 117, 123, 237, 238, 239, 237, 238, 239, 240, 241, 66, 175, 237, 238, 239, 3, 218, 238, 240, 241, 242, 238, 240, 241, 251, 252, 218, 240, 242, 243, 230, 242, 243, 231, 244, 245, 246, 247, 231, 244, 245, 255, 150, 183, 244, 246, 247, 26, 170, 244, 246, 247, 47, 127, 163, 248, 249, 2, 47, 153, 233, 248, 249, 2, 84, 204, 209, 223, 250, 155, 241, 251, 252, 253, 177, 186, 241, 251, 252, 104, 155, 162, 251, 253, 161, 191, 210, 220, 254, 215, 245, 255, 256, 215, 255, 256, 257, 258, 169, 256, 257, 258, 181, 256, 257, 258, 261, 145, 182, 228, 259, 260, 12, 171, 228, 259, 260, 139, 179, 181, 258, 261],
	"data": [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2],
});


log(mat1.toString());
log(mat2.toString());
log(matR.toString());
log(mat1.multiply(mat2).toString());


/*
log( mat1.toDense() );
log( "-------------------------" );
log( "-------------------------" );
log( "-------------------------" );
log( mat2.toDense() );
*/
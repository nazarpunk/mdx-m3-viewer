export const MAGIC = 0x1A51504D; // MPQ\x1A reversed
export const HASH_TABLE_KEY = 0xC3AF3770; // Hash of (hashtable)
export const HASH_TABLE_INDEX = 0;
export const HASH_NAME_A = 1;
export const HASH_NAME_B = 2;
export const HASH_FILE_KEY = 3;
export const HASH_ENTRY_DELETED = 0xFFFFFFFE;
export const HASH_ENTRY_EMPTY = 0xFFFFFFFF;
export const BLOCK_TABLE_KEY = 0xEC83B3A3; // Hash of (blocktable)
export const FILE_IMPLODE = 0x00000100;
export const FILE_COMPRESSED = 0x00000200;
export const FILE_ENCRYPTED = 0x00010000;
export const FILE_OFFSET_ADJUSTED_KEY = 0x00020000;
export const FILE_PATCH_FILE = 0x00100000;
export const FILE_SINGLE_UNIT = 0x01000000;
export const FILE_DELETE_MARKER = 0x02000000;
export const FILE_SECTOR_CRC = 0x04000000;
export const FILE_EXISTS = 0x80000000;
export const COMPRESSION_HUFFMAN = 0x01;
export const COMPRESSION_DEFLATE = 0x02;
export const COMPRESSION_IMPLODE = 0x08;
export const COMPRESSION_BZIP2 = 0x10;
export const COMPRESSION_ADPCM_MONO = 0x40;
export const COMPRESSION_ADPCM_STEREO = 0x80;

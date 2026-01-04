#ifndef DEFS_H
#define DEFS_H

typedef unsigned char byte, uint8;
typedef unsigned short word, uint16;
typedef unsigned int dword, uint32;
typedef unsigned long long qword, uint64;

_Static_assert(sizeof(byte)  == sizeof(uint8)  && sizeof(uint8) == 1,  "uint8 (aka byte) must be one byte");
_Static_assert(sizeof(word)  == sizeof(uint16) && sizeof(uint16) == 2, "uint16 (aka word) must be 2 bytes");
_Static_assert(sizeof(dword) == sizeof(uint32) && sizeof(uint32) == 4, "uint32 (aka dword) must be 4 bytes");
_Static_assert(sizeof(qword) == sizeof(uint64) && sizeof(uint64) == 8, "uint64 (aka qword) must be 8 bytes");

#endif


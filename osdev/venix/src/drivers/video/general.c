#include <types.h>

extern void vga_print(const char* str);

void print(const char* str) {
    vga_print(str);
}

void println(const char* str) {
    print(str);
    print("\n");
}

bool printk(const char* str) {
#ifndef __VENIX_DISABLE_KPRINT
    println(str);
    return true;
#else
    return false;
#endif
}
#ifndef PORTS_H
#define PORTS_H

#include "defs.h"

static inline byte inb(word port) {
    byte result;
    asm volatile("inb %1, %0" : "=a"(result) : "Nd"(port));
    return result;
}

static inline void outb(word port, byte value) {
    asm volatile("outb %0, %1" : : "a"(value), "Nd"(port));
}

#endif // PORTS_H


#include "rand.h"

static word lfsr = 0xACE1; // fallback seed

// read value from CMOS register via BIOS ports
static inline byte cmos_read(byte reg) {
    asm volatile (
        "outb %1, $0x70\n\t"  // select CMOS register
        "inb $0x71, %0"       // read value
        : "=a"(reg)
        : "a"(reg)
    );
    return reg;
}

void init_rand(void) {
    byte sec  = cmos_read(0x00); // seconds
    byte min  = cmos_read(0x02); // minutes

    word seed = (word)sec | ((word)min << 8);

    // lfsr cannot be zero
    if (seed == 0) {
        seed = 0x1D3F;
    }

    lfsr = seed;
}

// 16-bit pseudo-random generator (LFSR)
word rand(void) {
    // tap mask for 16-bit LFSR: x^16 + x^14 + x^13 + x^11 + 1
    word bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
    lfsr = (lfsr >> 1) | (bit << 15);

    return lfsr;
}

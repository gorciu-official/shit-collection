#include "sleep.h"
#include "ports.h"

#define PIT_FREQ 1193182
#define PIT_HZ   1000
#define PIT_DIV  (PIT_FREQ / PIT_HZ)

static word  pit_last;
static qword pit_ms;
static dword pit_frac;

void init_timer() {
    outb(0x43, 0x34);
    outb(0x40, PIT_DIV & 0xFF);
    outb(0x40, PIT_DIV >> 8);

    outb(0x43, 0x00);
    pit_last  = inb(0x40);
    pit_last |= inb(0x40) << 8;

    pit_ms   = 0;
    pit_frac = 0;
}

static inline void time_update() {
    word now;

    outb(0x43, 0x00);
    now  = inb(0x40);
    now |= inb(0x40) << 8;

    word elapsed;
    if (pit_last >= now)
        elapsed = pit_last - now;
    else
        elapsed = pit_last + PIT_DIV - now;

    pit_last = now;

    pit_frac += elapsed;
    pit_ms   += pit_frac / PIT_DIV;
    pit_frac %= PIT_DIV;
}

dword uptime_ms(void) {
    time_update();
    return pit_ms;
}

void sleep(dword duration_ms) {
    dword target = uptime_ms() + duration_ms;
    while (uptime_ms() < target) {
        asm volatile ("pause");
    }
}

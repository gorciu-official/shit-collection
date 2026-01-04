#ifndef SLEEP_H
#define SLEEP_H

#include "defs.h"

void init_timer();

dword uptime_ms();
void sleep(dword duration);

#endif // SLEEP_H

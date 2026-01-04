#ifndef UTILITY_H
#define UTILITY_H

#include "defs.h"

static inline byte count_digits(word x, byte base) {
    if (x == 0) return 1;

    int len = 0;
    while (x > 0) {
        x /= base;
        len++;
    }

    return len;
}

#endif // UTILITY_H


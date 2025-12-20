#include <lib/charchecks.h>

int atoi(const char *str) {
    int res = 0;
    int sign = 1;

    while (isspace((unsigned char)*str)) str++;

    if (*str == '-') {
        sign = -1;
        str++;
    } else if (*str == '+') {
        str++;
    }

    while (isdigit((unsigned char)*str)) {
        res = res * 10 + (*str - '0');
        str++;
    }

    return sign * res;
}
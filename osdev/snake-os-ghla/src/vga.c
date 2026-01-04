#include "include/vga.h"

static word* video_memory = (word*) VIDEO_MEMORY;

void setchar(byte x, byte y, byte cp, byte color) {
    if (x >= SCREEN_WIDTH || y >= SCREEN_HEIGHT) return;
    video_memory[y * SCREEN_WIDTH + x] = (color << 8) | cp;
}

void paintchar(byte x, byte y, byte color) {
    video_memory[y * SCREEN_WIDTH + x] = (video_memory[y * SCREEN_WIDTH + x] & 0x00FF) | (color << 8);
}

void swapchar(byte x, byte y, byte cp) {
    video_memory[y * SCREEN_WIDTH + x] = (video_memory[y * SCREEN_WIDTH + x] & 0xFF00) | cp;
}

void printstr(word start_x, byte y, const char *str, byte color) {
    while (*str) {
        setchar(start_x++, y, *str++, color);
    }
}

void clearchar(byte x, byte y) {
    swapchar(x, y, ' ');
}

void printint(word start_x, byte y, dword value, byte color) {
    char buffer[24];
    int index = 23;

    buffer[index--] = '\0';

    do {
        buffer[index--] = '0' + (value % 10);
        value /= 10;
    } while (value > 0);

    for (int i = index + 1; buffer[i] != '\0'; i++) {
        setchar(start_x++, y, buffer[i], color);
    }
}

void fillscreen(byte cp, byte color) {
    for (byte x = 0; x < SCREEN_WIDTH; x++) {
        for (byte y = 0; y < SCREEN_HEIGHT; y++) {
            setchar(x, y, cp, color);
        }
    }
}

void fillcol(byte x, byte cp, byte color) {
    if (x >= SCREEN_WIDTH) {
        return;
    }

    for (byte y = 0; y < SCREEN_HEIGHT; ++y) {
        setchar(x, y, cp, color);
    }
}

void fillline(byte y, byte cp, byte color) {
    if (y >= SCREEN_HEIGHT) {
        return;
    }

    for (byte x = 0; x < SCREEN_WIDTH; ++x) {
        setchar(x, y, cp, color);
    }
}

void fillrect(byte start_x, byte start_y, byte w, byte h, byte cp, byte color) {
    for (byte x = start_x; x < start_x + w; ++x) {
        for (byte y = start_y; y < start_y + h; ++y) {
            setchar(x, y, cp, color);
        }
    }
}

void clearscreen() {
     for (byte x = 0; x < SCREEN_WIDTH; x++) {
        for (byte y = 0; y < SCREEN_HEIGHT; y++) {
            swapchar(x, y, ' ');
        }
    }   
}

void clearcol(byte x) {
    if (x >= SCREEN_WIDTH) {
        return;
    }

    for (byte y = 0; y < SCREEN_HEIGHT; ++y) {
        swapchar(x, y, ' ');
    }
}

void clearline(byte y) {
    if (y >= SCREEN_HEIGHT) {
        return;
    }

    for (byte x = 0; x < SCREEN_WIDTH; ++x) {
        swapchar(x, y, ' ');
    }
}

void clearrect(byte start_x, byte start_y, byte w, byte h) {
    for (byte x = start_x; x < start_x + w; ++x) {
        for (byte y = start_y; y < start_y + h; ++y) {
            swapchar(x, y, ' ');
        }
    } 
}

#ifndef VGA_H
#define VGA_H

#include "defs.h"

#define VIDEO_MEMORY 0xB8000
#define SCREEN_WIDTH 80
#define SCREEN_HEIGHT 25

#define BLACK         0x0
#define BLUE          0x1
#define GREEN         0x2
#define CYAN          0x3
#define RED           0x4
#define MAGENTA       0x5
#define BROWN         0x6
#define LIGHT_GRAY    0x7
#define DARK_GRAY     0x8
#define LIGHT_BLUE    0x9
#define LIGHT_GREEN   0xA
#define LIGHT_CYAN    0xB
#define LIGHT_RED     0xC
#define LIGHT_MAGENTA 0xD
#define YELLOW        0xE
#define WHITE         0xF

#define VGA_COLOR(fg, bg) ((bg << 4) | fg)

void setchar(byte x, byte y, byte cp, byte color);
void clearchar(byte x, byte y);


void paintchar(byte x, byte y, byte color);
void swapchar(byte x, byte y, byte cp);

void printstr(word start_x, byte y, const char* str, byte color);
void printint(word start_x, byte y, dword value, byte color);

void fillscreen(byte cp, byte color);
void fillcol(byte x, byte cp, byte color);
void fillline(byte y, byte cp, byte color);
void fillrect(byte start_x, byte start_y, byte w, byte h, byte cp, byte color);

void clearscreen();
void clearcol(byte x);
void clearline(byte y);
void clearrect(byte x, byte y, byte w, byte h);

#endif // VGA_H

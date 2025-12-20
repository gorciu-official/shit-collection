#include <types.h>
#include <lib/string.h>
#include <lib/charchecks.h>
#include "vgaint.h"
#include "vgamem.h"

static uint8_t fg_color = LIGHT_GREY;
static uint8_t bg_color = BLACK;
static int cursor_x = 0;
static int cursor_y = 0;

static volatile uint16_t* vga_buffer = VGA_MEMORY;

static void vga_move_cursor(int x, int y) {
    if(x < 0) x = 0;
    if(x >= VGA_WIDTH) x = VGA_WIDTH - 1;
    if(y < 0) y = 0;
    if(y >= VGA_HEIGHT) y = VGA_HEIGHT - 1;

    cursor_x = x;
    cursor_y = y;

    uint16_t pos = cursor_y * VGA_WIDTH + cursor_x;
    outb(0x3D4, 0x0F);
    outb(0x3D5, (uint8_t)(pos & 0xFF));
    outb(0x3D4, 0x0E);
    outb(0x3D5, (uint8_t)((pos >> 8) & 0xFF));
}

static void vga_scroll_if_needed() {
    if(cursor_y >= VGA_HEIGHT) {
        for(int y = 1; y < VGA_HEIGHT; y++) {
            for(int x = 0; x < VGA_WIDTH; x++) {
                vga_buffer[(y - 1) * VGA_WIDTH + x] = vga_buffer[y * VGA_WIDTH + x];
            }
        }
        uint16_t blank = make_vga_entry(' ', make_vga_color(fg_color, bg_color));
        for(int x = 0; x < VGA_WIDTH; x++) {
            vga_buffer[(VGA_HEIGHT - 1) * VGA_WIDTH + x] = blank;
        }
        cursor_y = VGA_HEIGHT - 1;
    }
}

static void vga_put_char(char c) {
    if(c == '\n') {
        cursor_x = 0;
        cursor_y++;
        vga_scroll_if_needed();
        vga_move_cursor(cursor_x, cursor_y);
        return;
    }
    if(c == '\r') {
        cursor_x = 0;
        vga_move_cursor(cursor_x, cursor_y);
        return;
    }
    if(c == '\b') {
        if(cursor_x > 0) cursor_x--;
        else if(cursor_y > 0) { cursor_y--; cursor_x = VGA_WIDTH-1; }
        vga_buffer[cursor_y * VGA_WIDTH + cursor_x] = make_vga_entry(' ', make_vga_color(fg_color, bg_color));
        vga_move_cursor(cursor_x, cursor_y);
        return;
    }

    vga_buffer[cursor_y * VGA_WIDTH + cursor_x] = make_vga_entry(c, make_vga_color(fg_color, bg_color));
    cursor_x++;
    if(cursor_x >= VGA_WIDTH) {
        cursor_x = 0;
        cursor_y++;
        vga_scroll_if_needed();
    }
    vga_move_cursor(cursor_x, cursor_y);
}

void vga_print(const char* str) {
    enum { NORMAL, ESC, CSI } state = NORMAL;
    char params[16];
    int param_len = 0;
    int params_int[4] = {0};
    int params_count = 0;

    while (*str) {
        char c = *str++;
        switch (state) {
            case NORMAL:
                if(c == 0x1B) {
                    state = ESC;
                } else {
                    vga_put_char(c);
                }
                break;
            case ESC:
                if(c == '[') {
                    state = CSI;
                    param_len = 0;
                    params_count = 0;
                    for (int i=0;i<4;i++) params_int[i] = 0;
                } else {
                    state = NORMAL;
                }
                break;
            case CSI:
                if ((c >= '0' && c <= '9') || c == ';') {
                    if (param_len < (int)sizeof(params) - 1)
                        params[param_len++] = c;
                } else {
                    params[param_len] = 0;

                    int p = 0;
                    char* ptr = params;
                    while (*ptr && params_count < 4) {
                        params_int[params_count++] = atoi(ptr);
                        char* sc = strchr(ptr, ';');
                        if (sc) ptr = sc+1;
                        else break;
                    }

                    if (c == 'm') {
                        for (int i=0; i < params_count; i++) {
                            int code = params_int[i];
                            if(code == 0) {
                                fg_color = LIGHT_GREY;
                                bg_color = BLACK;
                            } else if(code >= 30 && code <= 37) {
                                fg_color = code - 30;
                            } else if(code >= 40 && code <= 47) {
                                bg_color = code - 40;
                            }
                        }
                    } else if (c == 'H' || c == 'f') {
                        int row = params_count > 0 ? params_int[0] : 1;
                        int col = params_count > 1 ? params_int[1] : 1;
                        vga_move_cursor(col - 1, row - 1);
                    }
                    state = NORMAL;
                }
                break;
        }
    }
}
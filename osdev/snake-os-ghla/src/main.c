#include "input.h"
#include "sleep.h"
#include "snake-game.h"
#include "vga.h"
#include "rand.h"

void show_welcome_screen() {
    byte clr = VGA_COLOR(WHITE, GREEN);
    fillscreen(' ', clr);
    
    // the logo
    int lx = 56;
    int ly = 0;

    printstr(lx, ly++, "      _______", clr);
    printstr(lx, ly++, "     / _   _ \\", clr);
    printstr(lx, ly++, "    / (.) (.) \\", clr);
    printstr(lx, ly++, "   ( _________ )", clr);
    printstr(lx, ly++, "    \\`-V-|-V-'/", clr);
    printstr(lx, ly++, "     \\   |   /", clr);
    printstr(lx, ly++, "      \\  ^  /", clr);
    printstr(lx, ly++, "       \\    \\", clr);
    printstr(lx, ly++, "        \\    `-_", clr);
    printstr(lx, ly++, "         `-_    -_", clr);
    printstr(lx, ly++, "            -_    -_", clr);
    printstr(lx, ly++, "            _-    _-", clr);
    printstr(lx, ly++, "          _-    _-", clr);
    printstr(lx, ly++, "        _-    _-", clr);
    printstr(lx, ly++, "      _-    _-", clr);
    printstr(lx, ly++, "      -_    -_", clr);
    printstr(lx, ly++, "        -_    -_", clr);
    printstr(lx, ly++, "          -_    -_", clr);
    printstr(lx, ly++, "            -_    -_", clr);
    printstr(lx, ly++, "            _-    _-", clr);
    printstr(lx, ly++, "  ,-=:_-_-_-_ _ _-_-_-_:=-.", clr);
    printstr(lx, ly++, " /=I=I=I=I=I=I=I=I=I=I=I=I=\\", clr);
    printstr(lx, ly++, "|=I=I=I=I=I=I=I=I=I=I=I=I=I=|", clr);
    printstr(lx, ly++, "|I=I=I=I=I=I=I=I=I=I=I=I=I=I|", clr);
    printstr(lx, ly++, "\\=I=I=I=I=I=I=I=I=I=I=I=I=I=/", clr);
    printstr(lx, ly++, " \\=I=I=I=I=I=I=I=I=I=I=I=I=/", clr);
    printstr(lx, ly++, "  \\=I=I=I=I=I=I=I=I=I=I=I=/", clr);
    printstr(lx, ly++, "   \\=I=I=I=I=I=I=I=I=I=I=/", clr);
    printstr(lx, ly++, "    \\=I=I=I=I=I=I=I=I=I=/", clr);
                                                                       
    // the text
    int x = 0;
    int y = 1;

    int spacex = 23;
    byte lightgreen = VGA_COLOR(LIGHT_GREEN, GREEN);

    byte altclr = lightgreen;

    while (1) {
        y = 1;

        printstr(x, y++, "  ####  #    #   ##   #    # ######        ####   ####  ", clr); 
        printstr(x, y++, " #      ##   #  #  #  #   #  #            #    # #      ", clr); 
        printstr(x, y++, "  ####  # #  # #    # ####   #####  ##### #    #  ####  ", clr); 
        printstr(x, y++, "      # #  # # ###### #  #   #            #    #      # ", clr); 
        printstr(x, y++, " #    # #   ## #    # #   #  #            #    # #    # ", clr); 
        printstr(x, y++, "  ####  #    # #    # #    # ######        ####   ####  ", clr); 
        printstr(x, y++, "                                                        ", clr);
        printstr(x, y++, "                                                        ", clr); 
        printstr(x, y++, "                                                        ", clr);
        printstr(x, y++, "                                                        ", clr);
        printstr(x, y, " #####   ##   #####    ", clr); printstr(spacex, y++, " ####  #####    ##    ####  ######", altclr); 
        printstr(x, y, "   #    #  #  #    #   ", clr); printstr(spacex, y++, "#      #    #  #  #  #    # #     ", altclr); 
        printstr(x, y, "   #   #    # #    #   ", clr); printstr(spacex, y++, " ####  #    # #    # #      ##### ", altclr); 
        printstr(x, y, "   #   ###### #####    ", clr); printstr(spacex, y++, "     # #####  ###### #      #     ", altclr); 
        printstr(x, y, "   #   #    # #        ", clr); printstr(spacex, y++, "#    # #      #    # #    # #     ", altclr); 
        printstr(x, y, "   #   #    # #        ", clr); printstr(spacex, y++, " ####  #      #    #  ####  ######", altclr); 
        printstr(x, y++, "                                        on your keyboard", clr);
        printstr(x, y++, "                                                        ", clr);
        printstr(x, y++, " #####  ####     #####  #        ##   #   #             ", clr);
        printstr(x, y++, "   #   #    #    #    # #       #  #   # #              ", clr);
        printstr(x, y++, "   #   #    #    #    # #      #    #   #               ", clr);
        printstr(x, y++, "   #   #    #    #####  #      ######   #               ", clr);
        printstr(x, y++, "   #   #    #    #      #      #    #   #               ", clr);
        printstr(x, y++, "   #    ####     #      ###### #    #   #               ", clr);

        if (altclr == lightgreen) altclr = clr;
        else altclr = lightgreen;

        for (int i = 0; i < 5; ++i) {
            byte scancode = readscancode();
            byte keycode;
            if ((keycode = pressed(scancode))) {
                if (keycode == KEYCODE_SPACE) return;
            }
            sleep(100);
        }
    }
}

void smain() {
    init_timer();
    init_rand();
    show_welcome_screen();
    start_snake();
}

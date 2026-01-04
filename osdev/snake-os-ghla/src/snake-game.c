#include "snake-game.h"
#include "input.h"
#include "sleep.h"
#include "vga.h"
#include "rand.h"

#include "utility.h"

#define BOARD_X 1
#define BOARD_Y 1
#define BOARD_WIDTH 54
#define BOARD_HEIGHT (SCREEN_HEIGHT - 2)

#define UI_AREA_X 56
#define UI_AREA_Y 1
#define UI_AREA_WIDTH (79-55-2)
#define UI_AREA_HEIGHT (SCREEN_HEIGHT - 2)

typedef struct snake_element {
    byte x;
    byte y;
} snake_element_t;

typedef enum direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
} direction_t;

typedef struct snake {
    snake_element_t body[256];
    direction_t dir;

    word length;
} snake_t;

typedef struct food {
    byte x;
    byte y;
    byte color;
} food_t;

typedef struct gamedata {
    word attempt;
    word maxscore;
    dword max_playtime;
    word score;
    dword start_time;
    byte is_new_game;
} gamedata_t;

static snake_t snake;
static food_t food;

static gamedata_t gamedata;
static gamedata_t prev_gamedata;

const byte FOOD_COLORS[] = { VGA_COLOR(GREEN, BLACK), VGA_COLOR(RED, BLACK), VGA_COLOR(YELLOW, BLACK) };
const byte FOOD_COLORS_COUNT = sizeof(FOOD_COLORS) / sizeof(FOOD_COLORS[0]);

void print_ui_stat(byte x, byte y, const char* label, word value, word prev_value, byte color, byte is_first_frame) {
    if (value == prev_value && !is_first_frame) return;
    
    clearrect(x, y, UI_AREA_WIDTH, 1);
    printstr(x, y, label, color);

    int value_x = UI_AREA_X + UI_AREA_WIDTH - count_digits(value, 10);
    printint(value_x, y, value, color);
}

void print_ui_time_stat(byte x, byte y, const char* label, dword value, byte color, byte is_first_frame) {
    //clearrect(x, y, UI_AREA_WIDTH, 1);

    if (is_first_frame) printstr(x, y, label, color);
   
    if (value == 0) {
        printstr(UI_AREA_X + UI_AREA_WIDTH - 4, y, "0.0s", color);
        return;
    }

    dword seconds = value / 1000;
    dword milis = value % 1000 / 100;

    int w = count_digits(seconds, 10) + 3;
    int value_x = UI_AREA_X + UI_AREA_WIDTH - w;

    printint(value_x, y, seconds, color);
    value_x += count_digits(seconds, 10);
    setchar(value_x, y, '.', color);
    setchar(UI_AREA_X + UI_AREA_WIDTH - 2, y, '0', color);
    printint(value_x + 1, y, milis, color);
    setchar(UI_AREA_X + UI_AREA_WIDTH - 1, y, 's', color);
    clearchar(UI_AREA_X + UI_AREA_WIDTH, y);
}

byte isoccupied(int x, int y) {
    for (int i = 0; i < snake.length; i++)
        if (snake.body[i].x == x && snake.body[i].y == y)
            return 1;
    return 0;
}

void redraw_food() {
    setchar(food.x, food.y, 'o', food.color);
}

void addfood() {
    do {
        word random = rand();
        food.x = BOARD_X + (byte) random % BOARD_WIDTH;
        food.y = BOARD_Y + (random >> 8) % BOARD_HEIGHT;
        food.color = FOOD_COLORS[random % FOOD_COLORS_COUNT];

        redraw_food();
    } while (isoccupied(food.x, food.y));
}

void redraw_ui_if_needed(byte need_full_redraw) {
    const byte BORDER_COLOR = VGA_COLOR(WHITE, BLACK);
    const byte UI_TEXT_COLOR = VGA_COLOR(WHITE, BLACK);

    const byte BORDER_CHAR = 0xDB;

    if (need_full_redraw) {
        fillscreen(' ', VGA_COLOR(0, BLACK));

        fillcol(BOARD_X-1, BORDER_CHAR, BORDER_COLOR);
        fillcol(UI_AREA_X-1, BORDER_CHAR, BORDER_COLOR);
        fillcol(UI_AREA_X+UI_AREA_WIDTH+1, BORDER_CHAR, BORDER_COLOR);
    
        fillline(0, BORDER_CHAR, BORDER_COLOR);
        fillline(BOARD_Y+BOARD_HEIGHT, BORDER_CHAR, BORDER_COLOR);
    }

    redraw_food();

    byte ui_y = UI_AREA_Y + 1;
    
    print_ui_stat(UI_AREA_X + 1, ui_y++, "Attempt:", gamedata.attempt, prev_gamedata.attempt, UI_TEXT_COLOR, need_full_redraw);
    print_ui_stat(UI_AREA_X + 1, ui_y++, "Max Score:", gamedata.maxscore, prev_gamedata.maxscore, UI_TEXT_COLOR, need_full_redraw);
    print_ui_time_stat(UI_AREA_X + 1, ui_y++, "Play Time:", gamedata.max_playtime, UI_TEXT_COLOR, need_full_redraw);
    ui_y++;
    print_ui_stat(UI_AREA_X + 1, ui_y++, "Score:", gamedata.score, prev_gamedata.score, UI_TEXT_COLOR, need_full_redraw);
    print_ui_time_stat(UI_AREA_X + 1, ui_y++, "Play Time:", uptime_ms() - gamedata.start_time, UI_TEXT_COLOR, need_full_redraw);

    // I dont know why but this code causes a bootloop WHEN the size of the gamedata struct is greater than or equal to 16 bytes:
    //prev_gamedata = gamedata;

    // fix (ugly but works)
    for (word i = 0; i < sizeof(gamedata); ++i) {
        ((byte*) &prev_gamedata)[i] = ((byte*) &gamedata)[i];
    }
}

static direction_t opposite[] = {
    [UP] = DOWN,
    [DOWN] = UP,
    [LEFT] = RIGHT,
    [RIGHT] = LEFT
};

static direction_t prev_snake_dir;
void handleinput() {
    byte scancode = readscancode();
    byte keycode;
    if ((keycode = pressed(scancode))) {
        direction_t newdir;
        switch (keycode) {
        case KEYCODE_W: newdir = UP;    break;
        case KEYCODE_ARROW_UP: newdir = UP;    break;
        case KEYCODE_S: newdir = DOWN;  break;
        case KEYCODE_ARROW_DOWN: newdir = DOWN;  break;
        case KEYCODE_A: newdir = LEFT;  break;
        case KEYCODE_ARROW_LEFT: newdir = LEFT;  break;
        case KEYCODE_D: newdir = RIGHT; break;
        case KEYCODE_ARROW_RIGHT: newdir = RIGHT; break;
        default: return;
        }
        
        if (newdir != opposite[prev_snake_dir]) {
            snake.dir = newdir;
        }
    }
}

void init_new_game() {
    gamedata.score = 0;
    gamedata.start_time = uptime_ms();

    snake.dir = UP;
    snake.length = 1;
    snake.body[0].x = BOARD_WIDTH / 2;
    snake.body[0].y = (BOARD_HEIGHT-1) / 2;

    addfood();
    gamedata.attempt++;
    gamedata.is_new_game = 1;
}

void gameover() {
    const byte COLOR = VGA_COLOR(WHITE, RED);
    fillscreen(' ', COLOR);

    sleep(5000);

    init_new_game();
}

void update() {
    const byte SNAKE_COLOR = VGA_COLOR(WHITE, BLACK);
    const byte SNAKE_CHAR = '#';

    handleinput();

    snake_element_t old_tail = snake.body[snake.length - 1];

    for (word i = snake.length - 1; i > 0; i--) {
        snake.body[i] = snake.body[i - 1];
        handleinput();
    }

    prev_snake_dir = snake.dir;
    switch (snake.dir) {
    case UP:    snake.body[0].y -= 1; break;
    case DOWN:  snake.body[0].y += 1; break;
    case LEFT:  snake.body[0].x -= 1; break;
    case RIGHT: snake.body[0].x += 1; break;
    }

    snake_element_t head = snake.body[0];
    if (head.x < BOARD_X || head.x >= BOARD_X + BOARD_WIDTH
     || head.y < BOARD_Y || head.y >= BOARD_Y + BOARD_HEIGHT)
    {
        gameover();
    }

    for (word i = 1; i < snake.length; ++i) {
        if (head.x == snake.body[i].x && head.y == snake.body[i].y) {
            gameover();
            handleinput();
        }
    } 

    if (head.x == food.x && head.y == food.y) {
        snake.body[snake.length] = old_tail;
        snake.length++;
        gamedata.score++;
        if (isoccupied(food.x, food.y)) setchar(food.x, food.y, SNAKE_CHAR, SNAKE_COLOR);
        else clearchar(food.x, food.y);

        addfood();

        setchar(snake.body[snake.length - 1].x, snake.body[snake.length - 1].y, SNAKE_CHAR, SNAKE_COLOR);

        goto delay;
    }

    setchar(snake.body[0].x, snake.body[0].y, SNAKE_CHAR, SNAKE_COLOR);
    clearchar(old_tail.x, old_tail.y);

delay:
    handleinput();
    for (int i = 0; i < 50; ++i) {
        handleinput();
        redraw_ui_if_needed(gamedata.is_new_game);
        gamedata.is_new_game = 0;
        sleep(5);

        dword playtime = uptime_ms() - gamedata.start_time;
        if (playtime > gamedata.max_playtime) {
            gamedata.max_playtime = playtime;
        }
    }

    if (gamedata.score > gamedata.maxscore) {
        gamedata.maxscore = gamedata.score;
    }

}

void start_snake() {
    for (word i = 0; i < sizeof(gamedata); ++i) {
        ((byte*) &gamedata)[i] = 0;
    }
    init_new_game();
    while (1) update();
}

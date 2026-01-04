CC = clang
AS = nasm
LD = ld.lld

CFLAGS = --target=i686-elf -Wall -Wextra -m32 -ffreestanding -I src/include -nostdlib -fno-stack-protector -c
ASFLAGS = -f elf32
LDFLAGS = -m elf_i386 -T linker.ld

SRCS = $(wildcard src/*.c)
SRCAS = $(wildcard src/*.asm)
OBJS = $(SRCS:.c=.o) $(SRCAS:.asm=.o)

all: snake-os.elf
snake-os.elf: $(OBJS)
	$(LD) $(LDFLAGS) -o $@ $(OBJS)
%.o: %.c
	$(CC) $(CFLAGS) $< -o $@
%.o: %.asm
	$(AS) $(ASFLAGS) $< -o $@

clean:
	rm -f src/*.o snake-os.elf

run: 
	qemu-system-i386 -kernel snake-os.elf
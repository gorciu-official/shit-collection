#!/bin/bash

# Begin with compile-time dependencies check

set -e

dependencies_required=("gcc" "grub-mkrescue" "nasm" "ld" "xorriso" "mtools" "ghlac") # REMINDER: Remember to update this when a new tool is introduced to the toolchain.
dependencies_missing=()

for utility in "${dependencies_required[@]}"; do
    if ! command -v "$utility" &>/dev/null; then
        if [ ${#dependencies_missing[@]} -gt 0 ]; then
            echo "Some dependencies are missing!"
        fi
        sleep 0.2        
        dependencies_missing+=("$utility")
    fi
done

if [ ${#dependencies_missing[@]} -gt 0 ]; then
	    ./dep_install.sh
fi

ROOT_DIR="$(pwd)"
ASM_FILE="$ROOT_DIR/src/boot.ghla"
ASM_OBJECT="$ROOT_DIR/build/boot.o"
LINKER_SCRIPT="$ROOT_DIR/linker.ld"
KERNEL_OUTPUT="$ROOT_DIR/build/snake-os.bin"
OUT_DIR="$ROOT_DIR/out"
ISO_OUTPUT="$OUT_DIR/snake-os.iso"
ISO_DIR="$ROOT_DIR/build/iso"
BOOT_DIR="$ISO_DIR/boot"
GRUB_DIR="$BOOT_DIR/grub"
OBJECT_DIR="$ROOT_DIR/build"

mkdir -p "$OUT_DIR"
mkdir -p "$OBJECT_DIR"

echo ".c -> .o"
OBJECT_FILES=()
for SOURCE_FILE in $(find "$ROOT_DIR" -type f -name '*.c' ! -name '*.excluded.c'); do
    OBJECT_FILE="$OBJECT_DIR/$(basename "${SOURCE_FILE%.c}.o")"
    OBJECT_FILES+=("$OBJECT_FILE")
    gcc -Isrc/include -Wall -Wextra -m32 -ffreestanding -nostartfiles -Iinclude -nostdlib -fno-stack-protector -c "$SOURCE_FILE" -o "$OBJECT_FILE"
done

echo ".ghla -> .o"
/usr/local/bin/ghlac --nasm-f elf32 --transpile-only --obj-dir build "$ASM_FILE"

echo ".o -> .bin"
ld -m elf_i386 -T "$LINKER_SCRIPT" -o "$KERNEL_OUTPUT" "${OBJECT_FILES[@]}" "$ASM_OBJECT"

echo ".bin -> .iso"
mkdir -p "$GRUB_DIR"
cp "$KERNEL_OUTPUT" "$BOOT_DIR"
cat > "$GRUB_DIR/grub.cfg" << EOF
menuentry "Run Snake" {
    terminal_output console
    multiboot /boot/snake-os.bin
}
EOF

grub-mkrescue -o "$ISO_OUTPUT" "$ISO_DIR"

echo -e "\033[32mSuccess!\033[0m"

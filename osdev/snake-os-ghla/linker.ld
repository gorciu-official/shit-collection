OUTPUT_FORMAT(elf32-i386)
ENTRY(start)

PHDRS
 {
   text PT_LOAD FLAGS(5); /* r-x */
   data PT_LOAD FLAGS(6); /* rw- */
 }

SECTIONS
 {
   . = 0x100000;
 
   .multiboot : {
     *(.multiboot)
   } :text
 
   .text : {
     *(.text*)
     *(.rodata*)
   } :text
 
   .data : {
     *(.data*)
   } :data
 
   .bss : {
     *(.bss*)
     *(COMMON)
   } :data
 }

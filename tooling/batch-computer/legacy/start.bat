@echo off
title Batch Computer by Gorciu
cls

if not exist start.bat (
    echo [7m                                                             [0m  Batch Computer  [7m                                                                      [0m
    echo Problem detected! You renamed the start file or you started in from a different direcory.
    echo Press any key to shutdown this.
    pause > nul
    exit
)

:init

if exist cmos (
    goto :bios
)

echo [7m                                                             [0m  Batch Computer  [7m                                                                      [0m
echo Hello! This is probably the biggest batch project that you see on the Internet. 
echo This is a computer simulation / virtual machine written only in batch (with additions in VBS).
ping localhost -n 5 > nul
echo You can make your own disks (max 5), partitions (max 6 on one drive), and you can run OSes written in batch.
ping localhost -n 5 > nul
echo So you can launch OSM, GBS, and many others in one batch loader.
ping localhost -n 5 > nul
echo.
echo Who will use this batch computer?
set /p "user=>> "
cls
echo [7m                                                             [0m  Batch Computer  [7m                                                                      [0m
echo.
echo Setting up your computer for the first use...
mkdir cmos
echo set "user=%user%" >> cmos\getuser.bat
echo %date% %time% Runned device at first time. >> cmos\pc.log
ping localhost -n 5 > nul
echo %date% %time% Restarting to apply first use changes... >> cmos\pc.log

start start.bat
exit

:bios
echo %date% %time% Runned device. >> cmos\pc.log
cd bios
start /max bios.bat
exit
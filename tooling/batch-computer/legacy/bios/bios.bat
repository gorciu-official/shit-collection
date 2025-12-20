@echo off
title Batch Computer by Gorciu
cd ..
cd cmos
call getuser.bat
cd ..

if not exist cmos (
    echo [7m                                                             [0m  BIOS  [7m                                                                      [0m
    echo The computer can't run because the CMOS data is missing or not configured. Press any key to shutdown.
    pause > nul
    exit
)

if not exist disks (
    echo [7m                                                             [0m  BIOS  [7m                                                                      [0m
    echo The computer can't run because the computer hasn't got disks directory. Press any key to shutdown.
    pause > nul
    exit
)

cd disks

if not exist disk1 (
    echo [7m                                                             [0m  BIOS  [7m                                                                      [0m
    echo The computer can't run because the computer hasn't got any disks. Select an option to continue.
    echo.

    echo 1 - Create drive and install OS
    echo 2 - Shutdown

    set /p "choice=>> "
    setlocal enabledelayedexpansion
    if "!choice!"=="1" (
        goto :installer
    )
    if "!choice!"=="2" (
        exit
    )
    endlocal
    echo Incorrect choice. Click any key to reboot.
    pause > nul
    cd ..
    start start.bat
    exit
)

:boot
cls
echo [7m                                                             [0m  BIOS  [7m                                                                      [0m
echo Hello %user%! Type the required information to boot your computer. Type "B" in disk selection to go to BIOS Setup Utility.
setlocal enabledelayedexpansion
:bootdisk
set /p "disk=Disk: "
if "!disk!"=="1" (
    goto :bootpar
)
if "!disk!"=="2" (
    goto :bootpar
)
if "!disk!"=="3" (
    goto :bootpar
)
if "!disk!"=="4" (
    goto :bootpar
)
if "!disk!"=="5" (
    goto :bootpar
)
if "!disk!"=="B" (
    goto :setup
)
echo [91mInvalid choice.[0m
goto :bootdisk
:bootpar
set /p "part=Partition: "
if "!part!"=="1" (
    goto :bootos
)
if "!part!"=="2" (
    goto :bootos
)
if "!part!"=="3" (
    goto :bootos
)
if "!part!"=="4" (
    goto :bootos
)
if "!part!"=="5" (
    goto :bootos
)
if "!part!"=="6" (
    goto :bootos
)
echo [91mInvalid choice.[0m
goto :bootpar
:bootos
if not exist disk!disk! (
    echo [91mDisk not exists.[0m
    goto :bootdisk
)
cd disk!disk!
if not exist par!part! (
    echo [91mPartition not exists.[0m
    goto :bootpar
)
cd par!part!
:bootcheck
if exist main.bat (
    start /max main.bat
    exit
)
if exist run.bat (
    start /max run.bat
    exit
)
echo [91mOS doesn't exists there.[0m
echo Add the OS bootloader (run.bat or main.bat) in the opened explorer window
echo and press any key to try boot.
start explorer .
pause > nul
goto :bootcheck

:installer
cls
echo [7m                                                             [0m  Batch Computer  [7m                                                                      [0m
:disksel
echo Select disk to install OS (from 1 to 5, if you choose other the OS will not boot).
set /p "choice=>> "
echo Select partition to install OS. (from 1 to 6, if you choose other the OS will not boot).
set /p "choice2=>> "
setlocal enabledelayedexpansion
if not "!choice!"=="1" (
    if not exist disk1 (
        echo You must install the first OS on the first drive.
        goto :disksel
    )
)
if not exist disk!choice! (
    md disk!choice!
    echo !date! !time! Maked disk !choice!. >> ..\cmos\pc.log
)
cd disk!choice!
if not exist par!choice2! (
    md par!choice2!
    echo !date! !time! Maked partition !choice2!. >> ..\..\cmos\pc.log
)
cd par!choice2!
echo !date! !time! Installed OS. >> ..\..\..\cmos\pc.log
cls
echo [7m                                                             [0m  Batch Computer  [7m                                                                      [0m
echo Put your OS here. The OS will boot from main.bat or if the main.bat not found system will boot from run.bat.
echo Press any key to restart the machine.
start /max explorer .
pause > nul
cd ../../..
start start.bat
endlocal
exit

:setup
cls
echo [7m                                                             [0m  BIOS  [7m                                                                      [0m
echo BIOS Setup Utlity; v. 1.8.6; (C) 1998-2024 American Megatrends ^& Gorciu
echo.
echo 1 - Install OS or make the partition
echo 2 - Reset machine to fabric settings
echo 3 - Exit to boot
set /p "choice=>> "
setlocal enabledelayedexpansion
if "!choice!"=="1" (
    goto :installer
)
if "!choice!"=="2" (
    cd ..
    del /s /q cmos\* > nul
    rmdir cmos
    md disks
    start start.bat
    exit
)
if "!choice!"=="3" (
    goto boot
)
endlocal
goto :setup